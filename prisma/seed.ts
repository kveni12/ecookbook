import bcrypt from "bcryptjs";
import {
  MembershipRole,
  RecipeVisibility,
  SourceType,
  PrismaClient
} from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("family1234", 10);

  const [maya, arjun] = await Promise.all([
    db.user.upsert({
      where: { email: "maya@familycookbook.dev" },
      update: {},
      create: {
        name: "Maya Raman",
        email: "maya@familycookbook.dev",
        passwordHash
      }
    }),
    db.user.upsert({
      where: { email: "arjun@familycookbook.dev" },
      update: {},
      create: {
        name: "Arjun Raman",
        email: "arjun@familycookbook.dev",
        passwordHash
      }
    })
  ]);

  const space = await db.cookbookSpace.upsert({
    where: { slug: "raman-family-kitchen" },
    update: {},
    create: {
      name: "Raman Family Kitchen",
      slug: "raman-family-kitchen",
      description: "Recipes, voice notes, and keepsakes from the Raman family.",
      ownerId: maya.id
    }
  });

  await db.membership.upsert({
    where: { userId_spaceId: { userId: maya.id, spaceId: space.id } },
    update: { role: MembershipRole.OWNER },
    create: { userId: maya.id, spaceId: space.id, role: MembershipRole.OWNER }
  });

  await db.membership.upsert({
    where: { userId_spaceId: { userId: arjun.id, spaceId: space.id } },
    update: { role: MembershipRole.EDITOR },
    create: { userId: arjun.id, spaceId: space.id, role: MembershipRole.EDITOR }
  });

  const recipes = [
    {
      title: "Grandma Leela's Dosa",
      subtitle: "Crisp edges, soft center, and the smell of Sunday mornings.",
      story: "Leela made this batter in giant steel bowls before every family visit.",
      category: "Breakfast",
      cuisine: "South Indian",
      mainIngredients: ["rice", "urad dal", "fenugreek"],
      tags: ["heirloom", "weekend"],
      dietaryTags: ["vegetarian"],
      sourceType: SourceType.FAMILY_ORAL_HISTORY,
      authorName: "Leela Raman",
      visibility: RecipeVisibility.SPACE,
      ingredients: ["3 cups rice", "1 cup urad dal", "1 tsp fenugreek seeds", "Salt to taste"],
      steps: ["Soak rice and dal separately.", "Blend until smooth.", "Ferment overnight.", "Cook on a hot griddle."],
      createdById: maya.id
    },
    {
      title: "Sunday Chicken Curry",
      subtitle: "The one that always means everyone is home.",
      story: "Maya's mother started the onions before sunrise whenever cousins were visiting.",
      category: "Dinner",
      cuisine: "Indian",
      mainIngredients: ["chicken", "onion", "tomato"],
      tags: ["family-favorite"],
      dietaryTags: [],
      sourceType: SourceType.MANUAL,
      authorName: "Maya Raman",
      visibility: RecipeVisibility.SPACE,
      ingredients: ["2 lb chicken", "3 onions", "4 tomatoes", "Spice blend"],
      steps: ["Brown onions.", "Add tomatoes and spices.", "Simmer chicken until tender."],
      createdById: maya.id
    },
    {
      title: "Lemon Rice for Picnics",
      subtitle: "Travel food that somehow tastes better from a steel tiffin.",
      story: "Packed for every park day and train ride.",
      category: "Lunch",
      cuisine: "South Indian",
      mainIngredients: ["rice", "lemon", "peanuts"],
      tags: ["travel", "quick"],
      dietaryTags: ["vegetarian", "gluten-free"],
      sourceType: SourceType.MANUAL,
      authorName: "Arjun Raman",
      visibility: RecipeVisibility.SPACE,
      ingredients: ["3 cups cooked rice", "2 lemons", "1/2 cup peanuts", "Tempering spices"],
      steps: ["Temper spices.", "Fold into rice.", "Finish with lemon juice."],
      createdById: arjun.id
    },
    {
      title: "Holiday Carrot Halwa",
      subtitle: "Slow-cooked until the whole kitchen smells festive.",
      story: "Reserved for celebrations and winter birthdays.",
      category: "Dessert",
      cuisine: "Indian",
      mainIngredients: ["carrot", "milk", "cardamom"],
      tags: ["holiday", "dessert"],
      dietaryTags: ["vegetarian"],
      sourceType: SourceType.WEBSITE,
      authorName: "Maya Raman",
      visibility: RecipeVisibility.SPACE,
      ingredients: ["2 lb carrots", "4 cups milk", "Sugar", "Cardamom"],
      steps: ["Cook carrots in milk.", "Reduce slowly.", "Finish with sugar and cardamom."],
      createdById: maya.id
    },
    {
      title: "Auntie Maya's Chutney",
      subtitle: "Sharp, bright, and always requested twice.",
      story: "Originally copied from a paper card tucked into an old spice tin.",
      category: "Condiment",
      cuisine: "Indian",
      mainIngredients: ["coconut", "green chili", "ginger"],
      tags: ["condiment"],
      dietaryTags: ["vegetarian"],
      sourceType: SourceType.FAMILY_ORAL_HISTORY,
      authorName: "Maya Raman",
      visibility: RecipeVisibility.SPACE,
      ingredients: ["1 coconut", "2 green chilies", "1 inch ginger", "Salt"],
      steps: ["Blend all ingredients.", "Temper mustard seeds on top."],
      createdById: maya.id
    },
    {
      title: "Late-Night Tomato Rasam",
      subtitle: "Comfort food for stormy evenings and scratchy throats.",
      story: "Arjun made this while learning how to cook from memory instead of measurements.",
      category: "Soup",
      cuisine: "South Indian",
      mainIngredients: ["tomato", "garlic", "pepper"],
      tags: ["comfort", "healing"],
      dietaryTags: ["vegetarian", "gluten-free"],
      sourceType: SourceType.MANUAL,
      authorName: "Arjun Raman",
      visibility: RecipeVisibility.PRIVATE,
      ingredients: ["4 tomatoes", "4 garlic cloves", "Pepper", "Tamarind water"],
      steps: ["Simmer tomatoes.", "Add tamarind and spices.", "Finish with garlic tempering."],
      createdById: arjun.id
    }
  ];

  const createdRecipes = [];
  for (const recipe of recipes) {
    const created = await db.recipe.create({
      data: {
        spaceId: recipe.visibility === RecipeVisibility.SPACE ? space.id : null,
        title: recipe.title,
        subtitle: recipe.subtitle,
        story: recipe.story,
        category: recipe.category,
        cuisine: recipe.cuisine,
        mainIngredients: recipe.mainIngredients,
        tags: recipe.tags,
        dietaryTags: recipe.dietaryTags,
        sourceType: recipe.sourceType,
        authorName: recipe.authorName,
        visibility: recipe.visibility,
        createdById: recipe.createdById,
        lastEditedById: recipe.createdById,
        ingredients: {
          create: recipe.ingredients.map((item, index) => ({
            position: index,
            item
          }))
        },
        steps: {
          create: recipe.steps.map((instruction, index) => ({
            position: index,
            instruction
          }))
        }
      }
    });
    createdRecipes.push(created);
  }

  const adaptationA = await db.recipe.create({
    data: {
      spaceId: null,
      parentRecipeId: createdRecipes[0].id,
      title: "Grandma Leela's Dosa (Extra Crispy)",
      subtitle: "Arjun's version with rice flour for weeknight batter.",
      lineageNote: "Adapted from Grandma Leela's Dosa",
      mainIngredients: ["rice flour", "urad dal"],
      tags: ["adaptation", "weekday"],
      dietaryTags: ["vegetarian"],
      sourceType: SourceType.MANUAL,
      authorName: "Arjun Raman",
      visibility: RecipeVisibility.PRIVATE,
      createdById: arjun.id,
      lastEditedById: arjun.id,
      ingredients: {
        create: [
          { position: 0, item: "2 cups rice flour" },
          { position: 1, item: "1 cup urad dal batter" }
        ]
      },
      steps: {
        create: [
          { position: 0, instruction: "Whisk batter until loose." },
          { position: 1, instruction: "Cook thin on a very hot pan." }
        ]
      }
    }
  });

  const adaptationB = await db.recipe.create({
    data: {
      spaceId: space.id,
      parentRecipeId: createdRecipes[1].id,
      title: "Sunday Chicken Curry (Pressure Cooker)",
      subtitle: "Shorter cooking time without losing the cozy flavor.",
      lineageNote: "Adapted from Sunday Chicken Curry",
      mainIngredients: ["chicken", "onion", "tomato"],
      tags: ["adaptation", "weeknight"],
      dietaryTags: [],
      sourceType: SourceType.MANUAL,
      authorName: "Maya Raman",
      visibility: RecipeVisibility.SPACE,
      createdById: maya.id,
      lastEditedById: maya.id,
      ingredients: {
        create: [
          { position: 0, item: "2 lb chicken" },
          { position: 1, item: "2 onions" },
          { position: 2, item: "3 tomatoes" }
        ]
      },
      steps: {
        create: [
          { position: 0, instruction: "Saute onions and tomatoes in cooker base." },
          { position: 1, instruction: "Add chicken and spices." },
          { position: 2, instruction: "Pressure cook briefly and finish uncovered." }
        ]
      }
    }
  });

  await db.recipeComment.createMany({
    data: [
      {
        recipeId: createdRecipes[0].id,
        userId: arjun.id,
        body: "The batter ferments faster in our warmer kitchen now."
      },
      {
        recipeId: adaptationB.id,
        userId: maya.id,
        body: "This version is ideal for weeknights but still tastes like the original."
      }
    ]
  });

  await db.recipeFavorite.createMany({
    data: [
      { recipeId: createdRecipes[1].id, userId: arjun.id, rating: 5 },
      { recipeId: createdRecipes[0].id, userId: maya.id, rating: 5 }
    ]
  });

  await db.personalRecipeNote.upsert({
    where: {
      recipeId_userId: {
        recipeId: createdRecipes[0].id,
        userId: arjun.id
      }
    },
    update: { body: "Thin the batter a touch more for my cast-iron pan." },
    create: {
      recipeId: createdRecipes[0].id,
      userId: arjun.id,
      body: "Thin the batter a touch more for my cast-iron pan."
    }
  });

  const cookbook = await db.cookbook.upsert({
    where: { slug: "holiday-recipes" },
    update: {},
    create: {
      spaceId: space.id,
      createdById: maya.id,
      title: "Holiday Recipes",
      subtitle: "Recipes for birthdays, winter visits, and crowded tables.",
      description: "A web-first family cookbook with stories and celebratory staples.",
      slug: "holiday-recipes"
    }
  });

  for (const [index, recipe] of [createdRecipes[0], createdRecipes[3], createdRecipes[1]].entries()) {
    await db.cookbookRecipe.upsert({
      where: {
        cookbookId_recipeId: {
          cookbookId: cookbook.id,
          recipeId: recipe.id
        }
      },
      update: { position: index },
      create: {
        cookbookId: cookbook.id,
        recipeId: recipe.id,
        position: index
      }
    });
  }
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  });
