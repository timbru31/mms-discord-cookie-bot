#!/usr/bin/env node
import { App } from "@aws-cdk/core";
import "source-map-support/register";
import { CookieMonsterStack } from "../lib/cookie-monster-stack";

const app = new App();
new CookieMonsterStack(app, "CookieMonsterStack", {});
