"""Meals module: recipes, meals, meal plans, and shopping lists."""

from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from auth import get_current_user
from database import get_session
from models import (
    Meal,
    MealPlan,
    MealPlanShare,
    MealPlanSlot,
    MealRecipe,
    Recipe,
    RecipeIngredient,
    RecipeShare,
    ShoppingList,
    ShoppingListItem,
    ShoppingListShare,
    User,
)
from schemas import (
    MealCreate,
    MealPlanCreate,
    MealPlanResponse,
    MealPlanSlotCreate,
    MealPlanSlotResponse,
    MealPlanUpdate,
    MealRecipeAdd,
    MealRecipeResponse,
    MealResponse,
    MealShareCreate,
    MealShareResponse,
    MealUpdate,
    RecipeBatchShareCreate,
    RecipeCreate,
    RecipeIngredientCreate,
    RecipeIngredientResponse,
    RecipeIngredientUpdate,
    RecipeResponse,
    RecipeUpdate,
    ShoppingListCreate,
    ShoppingListItemAdd,
    ShoppingListItemResponse,
    ShoppingListResponse,
)

router = APIRouter(prefix="/meals", tags=["meals"])


# ---------- Helpers ----------


def _meal_share_response(s: RecipeShare | MealPlanShare | ShoppingListShare) -> MealShareResponse:
    return MealShareResponse(
        id=s.id,
        shared_with_user_id=s.shared_with_user_id,
        shared_with_name=s.shared_with.name,
        shared_with_email=s.shared_with.email,
        permission=s.permission,
    )


def _recipe_response(recipe: Recipe, permission: str = "owner", owner: User | None = None) -> RecipeResponse:
    return RecipeResponse(
        id=recipe.id,
        user_id=recipe.user_id,
        name=recipe.name,
        description=recipe.description,
        servings=recipe.servings,
        category=recipe.category,
        created_at=recipe.created_at,
        ingredients=[RecipeIngredientResponse.model_validate(i) for i in recipe.ingredients],
        permission=permission,
        owner_id=owner.id if owner else None,
        owner_name=owner.name if owner else None,
        shares=[_meal_share_response(s) for s in recipe.shares] if permission == "owner" else [],
    )


def _meal_plan_slot_response(slot: MealPlanSlot) -> MealPlanSlotResponse:
    return MealPlanSlotResponse(
        id=slot.id,
        day_label=slot.day_label,
        slot_label=slot.slot_label,
        meal_id=slot.meal_id,
        meal_name=slot.meal.name if slot.meal else None,
        recipe_id=slot.recipe_id,
        recipe_name=slot.recipe.name if slot.recipe else None,
        position=slot.position,
    )


def _meal_plan_response(
    plan: MealPlan, permission: str = "owner", owner: User | None = None
) -> MealPlanResponse:
    return MealPlanResponse(
        id=plan.id,
        name=plan.name,
        created_at=plan.created_at,
        slots=[_meal_plan_slot_response(s) for s in plan.slots],
        permission=permission,
        owner_id=owner.id if owner else None,
        owner_name=owner.name if owner else None,
        shares=[_meal_share_response(s) for s in plan.shares] if permission == "owner" else [],
    )


def _shopping_list_response(
    lst: ShoppingList, permission: str = "owner", owner: User | None = None
) -> ShoppingListResponse:
    return ShoppingListResponse(
        id=lst.id,
        name=lst.name,
        source_plan_id=lst.source_plan_id,
        created_at=lst.created_at,
        items=[ShoppingListItemResponse.model_validate(i) for i in lst.items],
        permission=permission,
        owner_id=owner.id if owner else None,
        owner_name=owner.name if owner else None,
        shares=[_meal_share_response(s) for s in lst.shares] if permission == "owner" else [],
    )


async def _load_recipe(
    db: AsyncSession, recipe_id: int, user: User, require_write: bool = False
) -> tuple[Recipe, str]:
    result = await db.execute(
        select(Recipe)
        .options(selectinload(Recipe.ingredients), selectinload(Recipe.shares).selectinload(RecipeShare.shared_with))
        .where(Recipe.id == recipe_id)
    )
    recipe = result.scalar_one_or_none()
    if recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    if recipe.user_id == user.id:
        return recipe, "owner"
    share = next((s for s in recipe.shares if s.shared_with_user_id == user.id), None)
    if share is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    if require_write and share.permission != "write":
        raise HTTPException(status_code=403, detail="Write permission required")
    return recipe, share.permission


async def _load_meal_plan(
    db: AsyncSession, plan_id: int, user: User, require_write: bool = False
) -> tuple[MealPlan, str]:
    result = await db.execute(
        select(MealPlan)
        .options(
            selectinload(MealPlan.slots).selectinload(MealPlanSlot.meal),
            selectinload(MealPlan.slots).selectinload(MealPlanSlot.recipe),
            selectinload(MealPlan.shares).selectinload(MealPlanShare.shared_with),
        )
        .where(MealPlan.id == plan_id)
    )
    plan = result.scalar_one_or_none()
    if plan is None:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    if plan.user_id == user.id:
        return plan, "owner"
    share = next((s for s in plan.shares if s.shared_with_user_id == user.id), None)
    if share is None:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    if require_write and share.permission != "write":
        raise HTTPException(status_code=403, detail="Write permission required")
    return plan, share.permission


async def _load_shopping_list(
    db: AsyncSession, list_id: int, user: User, require_write: bool = False
) -> tuple[ShoppingList, str]:
    result = await db.execute(
        select(ShoppingList)
        .options(
            selectinload(ShoppingList.items),
            selectinload(ShoppingList.shares).selectinload(ShoppingListShare.shared_with),
        )
        .where(ShoppingList.id == list_id)
    )
    lst = result.scalar_one_or_none()
    if lst is None:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    if lst.user_id == user.id:
        return lst, "owner"
    share = next((s for s in lst.shares if s.shared_with_user_id == user.id), None)
    if share is None:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    if require_write and share.permission != "write":
        raise HTTPException(status_code=403, detail="Write permission required")
    return lst, share.permission


# ---------- Recipes ----------


@router.get("/recipes", response_model=list[RecipeResponse])
async def list_recipes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> list[RecipeResponse]:
    """List all recipes owned by or shared with the current user."""
    owned = (await db.execute(
        select(Recipe)
        .options(selectinload(Recipe.ingredients), selectinload(Recipe.shares).selectinload(RecipeShare.shared_with))
        .where(Recipe.user_id == current_user.id)
        .order_by(Recipe.name)
    )).scalars().all()

    shared_rows = (await db.execute(
        select(RecipeShare)
        .options(selectinload(RecipeShare.shared_with))
        .where(RecipeShare.shared_with_user_id == current_user.id)
    )).scalars().all()

    result = [_recipe_response(r) for r in owned]
    for share in shared_rows:
        recipe = (await db.execute(
            select(Recipe)
            .options(selectinload(Recipe.ingredients), selectinload(Recipe.shares))
            .where(Recipe.id == share.recipe_id)
        )).scalar_one_or_none()
        if recipe:
            owner = await db.get(User, recipe.user_id)
            result.append(_recipe_response(recipe, share.permission, owner))
    return result


@router.post("/recipes", response_model=RecipeResponse, status_code=201)
async def create_recipe(
    body: RecipeCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> RecipeResponse:
    recipe = Recipe(user_id=current_user.id, **body.model_dump())
    db.add(recipe)
    await db.commit()
    recipe, perm = await _load_recipe(db, recipe.id, current_user)
    return _recipe_response(recipe, perm)


@router.get("/recipes/shares", response_model=list[MealShareResponse])
async def list_recipe_shares_all(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> list[MealShareResponse]:
    """List all outgoing recipe shares for recipes owned by the current user."""
    owned_ids = (await db.execute(
        select(Recipe.id).where(Recipe.user_id == current_user.id)
    )).scalars().all()
    if not owned_ids:
        return []
    shares = (await db.execute(
        select(RecipeShare)
        .options(selectinload(RecipeShare.shared_with))
        .where(RecipeShare.recipe_id.in_(owned_ids))
    )).scalars().all()
    return [_meal_share_response(s) for s in shares]


@router.post("/recipes/shares/batch", response_model=list[MealShareResponse], status_code=201)
async def batch_share_recipes(
    body: RecipeBatchShareCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> list[MealShareResponse]:
    """Share multiple recipes with a user by email."""
    target = (await db.execute(select(User).where(User.email == body.email))).scalar_one_or_none()
    if target is None:
        raise HTTPException(status_code=404, detail="User not found")
    if target.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot share with yourself")

    created = []
    for rid in body.recipe_ids:
        recipe = await db.get(Recipe, rid)
        if recipe is None or recipe.user_id != current_user.id:
            continue
        existing = (await db.execute(
            select(RecipeShare)
            .where(RecipeShare.recipe_id == rid, RecipeShare.shared_with_user_id == target.id)
        )).scalar_one_or_none()
        if existing:
            existing.permission = body.permission
            await db.flush()
            await db.refresh(existing, ["shared_with"])
            created.append(existing)
        else:
            share = RecipeShare(
                recipe_id=rid, shared_with_user_id=target.id, permission=body.permission
            )
            db.add(share)
            await db.flush()
            await db.refresh(share, ["shared_with"])
            created.append(share)
    await db.commit()
    return [_meal_share_response(s) for s in created]


@router.get("/recipes/{recipe_id}", response_model=RecipeResponse)
async def get_recipe(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> RecipeResponse:
    recipe, perm = await _load_recipe(db, recipe_id, current_user)
    owner = None if perm == "owner" else await db.get(User, recipe.user_id)
    return _recipe_response(recipe, perm, owner)


@router.put("/recipes/{recipe_id}", response_model=RecipeResponse)
async def update_recipe(
    recipe_id: int,
    body: RecipeUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> RecipeResponse:
    recipe, perm = await _load_recipe(db, recipe_id, current_user, require_write=True)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(recipe, field, value)
    await db.commit()
    recipe, perm = await _load_recipe(db, recipe_id, current_user)
    return _recipe_response(recipe, perm)


@router.delete("/recipes/{recipe_id}", status_code=204)
async def delete_recipe(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> None:
    recipe, perm = await _load_recipe(db, recipe_id, current_user)
    if perm != "owner":
        raise HTTPException(status_code=403, detail="Only owner can delete")
    await db.delete(recipe)
    await db.commit()


@router.post("/recipes/{recipe_id}/ingredients", response_model=RecipeIngredientResponse, status_code=201)
async def add_ingredient(
    recipe_id: int,
    body: RecipeIngredientCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> RecipeIngredientResponse:
    recipe, _ = await _load_recipe(db, recipe_id, current_user, require_write=True)
    pos = len(recipe.ingredients)
    ing = RecipeIngredient(recipe_id=recipe_id, position=pos, **body.model_dump())
    db.add(ing)
    await db.commit()
    await db.refresh(ing)
    return RecipeIngredientResponse.model_validate(ing)


@router.put("/recipes/{recipe_id}/ingredients/{ing_id}", response_model=RecipeIngredientResponse)
async def update_ingredient(
    recipe_id: int,
    ing_id: int,
    body: RecipeIngredientUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> RecipeIngredientResponse:
    """Update an ingredient's name, amount or unit."""
    await _load_recipe(db, recipe_id, current_user, require_write=True)
    ing = await db.get(RecipeIngredient, ing_id)
    if ing is None or ing.recipe_id != recipe_id:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    ing.name = body.name
    ing.amount = body.amount
    ing.unit = body.unit
    await db.commit()
    await db.refresh(ing)
    return RecipeIngredientResponse.model_validate(ing)


@router.delete("/recipes/{recipe_id}/ingredients/{ing_id}", status_code=204)
async def delete_ingredient(
    recipe_id: int,
    ing_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> None:
    await _load_recipe(db, recipe_id, current_user, require_write=True)
    ing = await db.get(RecipeIngredient, ing_id)
    if ing is None or ing.recipe_id != recipe_id:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    await db.delete(ing)
    await db.commit()


@router.delete("/recipes/{recipe_id}/shares/{share_id}", status_code=204)
async def delete_recipe_share(
    recipe_id: int,
    share_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> None:
    recipe = await db.get(Recipe, recipe_id)
    if recipe is None or recipe.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Recipe not found")
    share = await db.get(RecipeShare, share_id)
    if share is None or share.recipe_id != recipe_id:
        raise HTTPException(status_code=404, detail="Share not found")
    await db.delete(share)
    await db.commit()


# ---------- Meals ----------


@router.get("/meal-list", response_model=list[MealResponse])
async def list_meals(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> list[MealResponse]:
    """List all meals owned by the current user."""
    rows = (await db.execute(
        select(Meal)
        .options(selectinload(Meal.meal_recipes).selectinload(MealRecipe.recipe))
        .where(Meal.user_id == current_user.id)
        .order_by(Meal.name)
    )).scalars().all()
    return [
        MealResponse(
            id=m.id,
            name=m.name,
            created_at=m.created_at,
            recipes=[
                MealRecipeResponse(
                    id=mr.id,
                    recipe_id=mr.recipe_id,
                    recipe_name=mr.recipe.name,
                    position=mr.position,
                )
                for mr in m.meal_recipes
            ],
        )
        for m in rows
    ]


@router.post("/meal-list", response_model=MealResponse, status_code=201)
async def create_meal(
    body: MealCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> MealResponse:
    meal = Meal(user_id=current_user.id, name=body.name.strip())
    db.add(meal)
    await db.commit()
    await db.refresh(meal)
    return MealResponse(id=meal.id, name=meal.name, created_at=meal.created_at, recipes=[])


@router.put("/meal-list/{meal_id}", response_model=MealResponse)
async def update_meal(
    meal_id: int,
    body: MealUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> MealResponse:
    meal = await db.get(Meal, meal_id)
    if meal is None or meal.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Meal not found")
    meal.name = body.name.strip()
    await db.commit()
    # reload with recipes
    row = (await db.execute(
        select(Meal)
        .options(selectinload(Meal.meal_recipes).selectinload(MealRecipe.recipe))
        .where(Meal.id == meal_id)
    )).scalar_one()
    return MealResponse(
        id=row.id, name=row.name, created_at=row.created_at,
        recipes=[MealRecipeResponse(id=mr.id, recipe_id=mr.recipe_id, recipe_name=mr.recipe.name, position=mr.position) for mr in row.meal_recipes],
    )


@router.delete("/meal-list/{meal_id}", status_code=204)
async def delete_meal(
    meal_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> None:
    meal = await db.get(Meal, meal_id)
    if meal is None or meal.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Meal not found")
    await db.delete(meal)
    await db.commit()


@router.post("/meal-list/{meal_id}/recipes", response_model=MealRecipeResponse, status_code=201)
async def add_recipe_to_meal(
    meal_id: int,
    body: MealRecipeAdd,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> MealRecipeResponse:
    meal = await db.get(Meal, meal_id)
    if meal is None or meal.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Meal not found")
    recipe = await db.get(Recipe, body.recipe_id)
    if recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    loaded = (await db.execute(
        select(Meal).options(selectinload(Meal.meal_recipes)).where(Meal.id == meal_id)
    )).scalar_one()
    pos = len(loaded.meal_recipes)
    mr = MealRecipe(meal_id=meal_id, recipe_id=body.recipe_id, position=pos)
    db.add(mr)
    await db.commit()
    await db.refresh(mr)
    return MealRecipeResponse(id=mr.id, recipe_id=mr.recipe_id, recipe_name=recipe.name, position=mr.position)


@router.delete("/meal-list/{meal_id}/recipes/{mr_id}", status_code=204)
async def remove_recipe_from_meal(
    meal_id: int,
    mr_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> None:
    meal = await db.get(Meal, meal_id)
    if meal is None or meal.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Meal not found")
    mr = await db.get(MealRecipe, mr_id)
    if mr is None or mr.meal_id != meal_id:
        raise HTTPException(status_code=404, detail="Not found")
    await db.delete(mr)
    await db.commit()


# ---------- Meal Plans ----------


@router.get("/plans", response_model=list[MealPlanResponse])
async def list_meal_plans(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> list[MealPlanResponse]:
    owned = (await db.execute(
        select(MealPlan)
        .options(
            selectinload(MealPlan.slots).selectinload(MealPlanSlot.meal),
            selectinload(MealPlan.slots).selectinload(MealPlanSlot.recipe),
            selectinload(MealPlan.shares).selectinload(MealPlanShare.shared_with),
        )
        .where(MealPlan.user_id == current_user.id)
        .order_by(MealPlan.created_at.desc())
    )).scalars().all()

    shared_shares = (await db.execute(
        select(MealPlanShare)
        .options(selectinload(MealPlanShare.shared_with))
        .where(MealPlanShare.shared_with_user_id == current_user.id)
    )).scalars().all()

    result = [_meal_plan_response(p) for p in owned]
    for share in shared_shares:
        plan, perm = await _load_meal_plan(db, share.meal_plan_id, current_user)
        owner = await db.get(User, plan.user_id)
        result.append(_meal_plan_response(plan, perm, owner))
    return result


@router.post("/plans", response_model=MealPlanResponse, status_code=201)
async def create_meal_plan(
    body: MealPlanCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> MealPlanResponse:
    plan = MealPlan(user_id=current_user.id, name=body.name.strip())
    db.add(plan)
    await db.commit()
    plan, perm = await _load_meal_plan(db, plan.id, current_user)
    return _meal_plan_response(plan, perm)


@router.put("/plans/{plan_id}", response_model=MealPlanResponse)
async def update_meal_plan(
    plan_id: int,
    body: MealPlanUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> MealPlanResponse:
    plan, perm = await _load_meal_plan(db, plan_id, current_user, require_write=True)
    if perm != "owner":
        raise HTTPException(status_code=403, detail="Only owner can rename")
    plan.name = body.name.strip()
    await db.commit()
    plan, perm = await _load_meal_plan(db, plan_id, current_user)
    return _meal_plan_response(plan, perm)


@router.delete("/plans/{plan_id}", status_code=204)
async def delete_meal_plan(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> None:
    plan, perm = await _load_meal_plan(db, plan_id, current_user)
    if perm != "owner":
        raise HTTPException(status_code=403, detail="Only owner can delete")
    await db.delete(plan)
    await db.commit()


@router.post("/plans/{plan_id}/slots", response_model=MealPlanSlotResponse, status_code=201)
async def add_plan_slot(
    plan_id: int,
    body: MealPlanSlotCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> MealPlanSlotResponse:
    plan, _ = await _load_meal_plan(db, plan_id, current_user, require_write=True)
    pos = len(plan.slots)
    slot = MealPlanSlot(
        meal_plan_id=plan_id,
        day_label=body.day_label.strip(),
        slot_label=body.slot_label.strip(),
        meal_id=body.meal_id,
        recipe_id=body.recipe_id,
        position=pos,
    )
    db.add(slot)
    await db.commit()
    await db.refresh(slot, ["meal", "recipe"])
    return _meal_plan_slot_response(slot)


@router.delete("/plans/{plan_id}/slots/{slot_id}", status_code=204)
async def delete_plan_slot(
    plan_id: int,
    slot_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> None:
    await _load_meal_plan(db, plan_id, current_user, require_write=True)
    slot = await db.get(MealPlanSlot, slot_id)
    if slot is None or slot.meal_plan_id != plan_id:
        raise HTTPException(status_code=404, detail="Slot not found")
    await db.delete(slot)
    await db.commit()


@router.get("/plans/{plan_id}/shares", response_model=list[MealShareResponse])
async def list_plan_shares(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> list[MealShareResponse]:
    plan, perm = await _load_meal_plan(db, plan_id, current_user)
    if perm != "owner":
        raise HTTPException(status_code=403, detail="Only owner can view shares")
    return [_meal_share_response(s) for s in plan.shares]


@router.post("/plans/{plan_id}/shares", response_model=MealShareResponse, status_code=201)
async def add_plan_share(
    plan_id: int,
    body: MealShareCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> MealShareResponse:
    plan, perm = await _load_meal_plan(db, plan_id, current_user)
    if perm != "owner":
        raise HTTPException(status_code=403, detail="Only owner can share")
    target = (await db.execute(select(User).where(User.email == body.email))).scalar_one_or_none()
    if target is None:
        raise HTTPException(status_code=404, detail="User not found")
    if target.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot share with yourself")
    existing = (await db.execute(
        select(MealPlanShare)
        .where(MealPlanShare.meal_plan_id == plan_id, MealPlanShare.shared_with_user_id == target.id)
    )).scalar_one_or_none()
    if existing:
        existing.permission = body.permission
        await db.commit()
        await db.refresh(existing, ["shared_with"])
        return _meal_share_response(existing)
    share = MealPlanShare(meal_plan_id=plan_id, shared_with_user_id=target.id, permission=body.permission)
    db.add(share)
    await db.commit()
    await db.refresh(share, ["shared_with"])
    return _meal_share_response(share)


@router.delete("/plans/{plan_id}/shares/{share_id}", status_code=204)
async def delete_plan_share(
    plan_id: int,
    share_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> None:
    plan = await db.get(MealPlan, plan_id)
    if plan is None or plan.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    share = await db.get(MealPlanShare, share_id)
    if share is None or share.meal_plan_id != plan_id:
        raise HTTPException(status_code=404, detail="Share not found")
    await db.delete(share)
    await db.commit()


# ---------- Shopping Lists ----------


async def _build_shopping_items(
    db: AsyncSession, meal_plan_id: int | None, recipe_ids: list[int]
) -> list[dict]:
    """Collect ingredients from a meal plan and/or direct recipe IDs."""
    all_recipe_ids: dict[int, str] = {}  # recipe_id -> source_recipe name

    if meal_plan_id:
        plan = (await db.execute(
            select(MealPlan)
            .options(
                selectinload(MealPlan.slots).selectinload(MealPlanSlot.meal).selectinload(Meal.meal_recipes),
                selectinload(MealPlan.slots).selectinload(MealPlanSlot.recipe),
            )
            .where(MealPlan.id == meal_plan_id)
        )).scalar_one_or_none()
        if plan:
            for slot in plan.slots:
                if slot.meal_id and slot.meal:
                    for mr in slot.meal.meal_recipes:
                        all_recipe_ids[mr.recipe_id] = slot.meal.name
                elif slot.recipe_id and slot.recipe:
                    all_recipe_ids[slot.recipe_id] = slot.recipe.name

    for rid in recipe_ids:
        if rid not in all_recipe_ids:
            r = await db.get(Recipe, rid)
            if r:
                all_recipe_ids[rid] = r.name

    items = []
    pos = 0
    for rid, source in all_recipe_ids.items():
        recipe = (await db.execute(
            select(Recipe).options(selectinload(Recipe.ingredients)).where(Recipe.id == rid)
        )).scalar_one_or_none()
        if not recipe:
            continue
        for ing in recipe.ingredients:
            items.append({
                "name": ing.name,
                "amount": ing.amount,
                "unit": ing.unit,
                "source_recipe": source,
                "position": pos,
            })
            pos += 1
    return items


@router.get("/shopping", response_model=list[ShoppingListResponse])
async def list_shopping_lists(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> list[ShoppingListResponse]:
    owned = (await db.execute(
        select(ShoppingList)
        .options(
            selectinload(ShoppingList.items),
            selectinload(ShoppingList.shares).selectinload(ShoppingListShare.shared_with),
        )
        .where(ShoppingList.user_id == current_user.id)
        .order_by(ShoppingList.created_at.desc())
    )).scalars().all()

    shared_shares = (await db.execute(
        select(ShoppingListShare)
        .options(selectinload(ShoppingListShare.shared_with))
        .where(ShoppingListShare.shared_with_user_id == current_user.id)
    )).scalars().all()

    result = [_shopping_list_response(lst) for lst in owned]
    for share in shared_shares:
        lst, perm = await _load_shopping_list(db, share.shopping_list_id, current_user)
        owner = await db.get(User, lst.user_id)
        result.append(_shopping_list_response(lst, perm, owner))
    return result


@router.post("/shopping", response_model=ShoppingListResponse, status_code=201)
async def create_shopping_list(
    body: ShoppingListCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> ShoppingListResponse:
    lst = ShoppingList(
        user_id=current_user.id,
        name=body.name.strip(),
        source_plan_id=body.meal_plan_id,
    )
    db.add(lst)
    await db.flush()

    items_data = await _build_shopping_items(db, body.meal_plan_id, body.recipe_ids)
    for d in items_data:
        db.add(ShoppingListItem(shopping_list_id=lst.id, **d))

    await db.commit()
    lst, perm = await _load_shopping_list(db, lst.id, current_user)
    return _shopping_list_response(lst, perm)


@router.delete("/shopping/{list_id}", status_code=204)
async def delete_shopping_list(
    list_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> None:
    lst, perm = await _load_shopping_list(db, list_id, current_user)
    if perm != "owner":
        raise HTTPException(status_code=403, detail="Only owner can delete")
    await db.delete(lst)
    await db.commit()


@router.post("/shopping/{list_id}/items", response_model=ShoppingListItemResponse, status_code=201)
async def add_shopping_item(
    list_id: int,
    body: ShoppingListItemAdd,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> ShoppingListItemResponse:
    lst, _ = await _load_shopping_list(db, list_id, current_user, require_write=True)
    pos = len(lst.items)
    item = ShoppingListItem(shopping_list_id=list_id, position=pos, **body.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return ShoppingListItemResponse.model_validate(item)


@router.put("/shopping/{list_id}/items/{item_id}", response_model=ShoppingListItemResponse)
async def toggle_shopping_item(
    list_id: int,
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> ShoppingListItemResponse:
    await _load_shopping_list(db, list_id, current_user, require_write=True)
    item = await db.get(ShoppingListItem, item_id)
    if item is None or item.shopping_list_id != list_id:
        raise HTTPException(status_code=404, detail="Item not found")
    item.checked = not item.checked
    await db.commit()
    await db.refresh(item)
    return ShoppingListItemResponse.model_validate(item)


@router.delete("/shopping/{list_id}/items/{item_id}", status_code=204)
async def delete_shopping_item(
    list_id: int,
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> None:
    await _load_shopping_list(db, list_id, current_user, require_write=True)
    item = await db.get(ShoppingListItem, item_id)
    if item is None or item.shopping_list_id != list_id:
        raise HTTPException(status_code=404, detail="Item not found")
    await db.delete(item)
    await db.commit()


@router.get("/shopping/{list_id}/shares", response_model=list[MealShareResponse])
async def list_shopping_shares(
    list_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> list[MealShareResponse]:
    lst, perm = await _load_shopping_list(db, list_id, current_user)
    if perm != "owner":
        raise HTTPException(status_code=403, detail="Only owner can view shares")
    return [_meal_share_response(s) for s in lst.shares]


@router.post("/shopping/{list_id}/shares", response_model=MealShareResponse, status_code=201)
async def add_shopping_share(
    list_id: int,
    body: MealShareCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> MealShareResponse:
    lst, perm = await _load_shopping_list(db, list_id, current_user)
    if perm != "owner":
        raise HTTPException(status_code=403, detail="Only owner can share")
    target = (await db.execute(select(User).where(User.email == body.email))).scalar_one_or_none()
    if target is None:
        raise HTTPException(status_code=404, detail="User not found")
    if target.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot share with yourself")
    existing = (await db.execute(
        select(ShoppingListShare)
        .where(ShoppingListShare.shopping_list_id == list_id, ShoppingListShare.shared_with_user_id == target.id)
    )).scalar_one_or_none()
    if existing:
        existing.permission = body.permission
        await db.commit()
        await db.refresh(existing, ["shared_with"])
        return _meal_share_response(existing)
    share = ShoppingListShare(shopping_list_id=list_id, shared_with_user_id=target.id, permission=body.permission)
    db.add(share)
    await db.commit()
    await db.refresh(share, ["shared_with"])
    return _meal_share_response(share)


@router.delete("/shopping/{list_id}/shares/{share_id}", status_code=204)
async def delete_shopping_share(
    list_id: int,
    share_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> None:
    lst = await db.get(ShoppingList, list_id)
    if lst is None or lst.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    share = await db.get(ShoppingListShare, share_id)
    if share is None or share.shopping_list_id != list_id:
        raise HTTPException(status_code=404, detail="Share not found")
    await db.delete(share)
    await db.commit()
