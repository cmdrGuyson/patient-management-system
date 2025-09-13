# syntax=docker/dockerfile:1.7-labs

ARG NODE_VERSION=20.18.0

FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app
ENV CI=true

RUN corepack enable && corepack prepare yarn@1.22.22 --activate

FROM base AS dev
ENV NODE_ENV=development
CMD ["node", "--version"]


