import test from "node:test";
import assert from "node:assert/strict";
import {
  ASSISTANT_KNOWLEDGE_SEED,
  PRICING_KNOWLEDGE,
  PRODUCT_FEATURES,
  SECTOR_PLAYBOOKS,
} from "./assistantKnowledge";

test("assistant knowledge covers every published feature and target sector", () => {
  assert.equal(PRODUCT_FEATURES.length, 13);
  assert.equal(SECTOR_PLAYBOOKS.length, 13);
  assert.equal(new Set(PRODUCT_FEATURES.map((feature) => feature.slug)).size, PRODUCT_FEATURES.length);
  assert.equal(new Set(SECTOR_PLAYBOOKS.map((sector) => sector.slug)).size, SECTOR_PLAYBOOKS.length);
});

test("sector playbooks only reference known features and contain an actionable workflow", () => {
  const featureSlugs = new Set(PRODUCT_FEATURES.map((feature) => feature.slug));
  for (const sector of SECTOR_PLAYBOOKS) {
    assert.ok(sector.workflow.length >= 5, `${sector.slug} needs a detailed workflow`);
    assert.ok(sector.pains.length >= 3, `${sector.slug} needs customer pain points`);
    assert.ok(sector.relevantFeatures.every((feature) => featureSlugs.has(feature)), `${sector.slug} references an unknown feature`);
  }
});

test("seed slugs are unique and include pricing plus truth policy", () => {
  const slugs = ASSISTANT_KNOWLEDGE_SEED.map((entry) => entry.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  assert.ok(slugs.includes("pricing-current"));
  assert.ok(slugs.includes("assistant-truth-policy"));
  assert.match(PRICING_KNOWLEDGE.pro.price, /345/);
  assert.match(PRICING_KNOWLEDGE.catalog.price, /575/);
  assert.match(PRICING_KNOWLEDGE.trial, /شهر/);
});
