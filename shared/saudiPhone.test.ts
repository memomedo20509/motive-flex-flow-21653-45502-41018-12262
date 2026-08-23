import assert from "node:assert/strict";
import test from "node:test";
import { isSaudiMobile, normalizeSaudiPhone, saudiPhoneSchema } from "./saudiPhone";

test("normalizes common Saudi mobile formats", () => {
  assert.equal(normalizeSaudiPhone("055 123 4567"), "+966551234567");
  assert.equal(normalizeSaudiPhone("00966 55 123 4567"), "+966551234567");
  assert.equal(normalizeSaudiPhone("٠٥٥١٢٣٤٥٦٧"), "+966551234567");
});

test("accepts Saudi mobile numbers and rejects non-Saudi numbers", () => {
  assert.equal(isSaudiMobile("+966551234567"), true);
  assert.equal(isSaudiMobile("01012345678"), false);
  assert.equal(saudiPhoneSchema.parse("0551234567"), "+966551234567");
  assert.throws(() => saudiPhoneSchema.parse("+201012345678"));
});
