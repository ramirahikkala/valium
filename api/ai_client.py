"""AI client: thin wrapper around Anthropic and OpenAI HTTP APIs."""

import asyncio

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
