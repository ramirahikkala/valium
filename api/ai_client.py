"""AI client: thin wrapper around Anthropic and OpenAI HTTP APIs."""

import asyncio
import base64

import requests as req
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import AIProvider


class AIError(Exception):
    """Raised when AI provider call fails or no provider is configured."""


async def get_active_provider(session: AsyncSession) -> AIProvider:
    """Return the first enabled AI provider, ordered by id. Raises AIError if none."""
    result = await session.execute(
        select(AIProvider).where(AIProvider.enabled == True).order_by(AIProvider.id).limit(1)
    )
    p = result.scalar_one_or_none()
    if not p:
        raise AIError("No AI provider configured")
    return p


async def ai_complete(session: AsyncSession, prompt: str, system: str = "") -> str:
    """Send a prompt to the active AI provider and return the text response."""
    p = await get_active_provider(session)

    def _call() -> str:
        if p.provider == "anthropic":
            return _call_anthropic(p.api_key, p.model, prompt, system)
        if p.provider == "openai":
            return _call_openai(p.api_key, p.model, prompt, system)
        raise AIError(f"Unknown provider: {p.provider}")

    return await asyncio.to_thread(_call)


async def ai_complete_with_image(
    session: AsyncSession,
    image_bytes: bytes,
    mime_type: str,
    prompt: str,
    system: str = "",
) -> str:
    """Send a prompt with an image to the active AI provider and return the text response."""
    p = await get_active_provider(session)

    def _call() -> str:
        if p.provider == "anthropic":
            return _call_anthropic_vision(p.api_key, p.model, image_bytes, mime_type, prompt, system)
        if p.provider == "openai":
            return _call_openai_vision(p.api_key, p.model, image_bytes, mime_type, prompt, system)
        raise AIError(f"Unknown provider: {p.provider}")

    return await asyncio.to_thread(_call)


def _call_anthropic(api_key: str, model: str, prompt: str, system: str) -> str:
    """Call the Anthropic Messages API and return the assistant text."""
    body: dict = {
        "model": model,
        "max_tokens": 1024,
        "messages": [{"role": "user", "content": prompt}],
    }
    if system:
        body["system"] = system
    r = req.post(
        "https://api.anthropic.com/v1/messages",
        headers={"x-api-key": api_key, "anthropic-version": "2023-06-01"},
        json=body,
        timeout=30,
    )
    r.raise_for_status()
    return r.json()["content"][0]["text"]


def _call_anthropic_vision(
    api_key: str, model: str, image_bytes: bytes, mime_type: str, prompt: str, system: str
) -> str:
    """Call the Anthropic Messages API with an image and return the assistant text."""
    b64 = base64.standard_b64encode(image_bytes).decode()
    body: dict = {
        "model": model,
        "max_tokens": 1024,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "image", "source": {"type": "base64", "media_type": mime_type, "data": b64}},
                    {"type": "text", "text": prompt},
                ],
            }
        ],
    }
    if system:
        body["system"] = system
    r = req.post(
        "https://api.anthropic.com/v1/messages",
        headers={"x-api-key": api_key, "anthropic-version": "2023-06-01"},
        json=body,
        timeout=30,
    )
    r.raise_for_status()
    return r.json()["content"][0]["text"]


def _call_openai(api_key: str, model: str, prompt: str, system: str) -> str:
    """Call the OpenAI Chat Completions API and return the assistant text."""
    msgs = []
    if system:
        msgs.append({"role": "system", "content": system})
    msgs.append({"role": "user", "content": prompt})
    r = req.post(
        "https://api.openai.com/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}"},
        json={"model": model, "messages": msgs},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"]


def _call_openai_vision(
    api_key: str, model: str, image_bytes: bytes, mime_type: str, prompt: str, system: str
) -> str:
    """Call the OpenAI Chat Completions API with an image and return the assistant text."""
    b64 = base64.standard_b64encode(image_bytes).decode()
    data_url = f"data:{mime_type};base64,{b64}"
    msgs = []
    if system:
        msgs.append({"role": "system", "content": system})
    msgs.append({
        "role": "user",
        "content": [
            {"type": "image_url", "image_url": {"url": data_url}},
            {"type": "text", "text": prompt},
        ],
    })
    r = req.post(
        "https://api.openai.com/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}"},
        json={"model": model, "messages": msgs},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"]
