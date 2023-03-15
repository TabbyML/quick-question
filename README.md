## ⁉️ QuickQuestion
![Docker build status](https://img.shields.io/github/actions/workflow/status/TabbyML/quick-question/docker.yml?label=docker%20image%20build)

> **Warning**
> This is work in progress, it is not a production ready solution.

## 🤔 What is this?

An incubating AI-powered stackoverflow for your codebase, by [TabbyML](https://tabbyml.com)

[Live Demo for pallets/flask](https://quick-question.fly.dev/pallets/flask)

![Example Quick Question](example-quick-question.png)

## 🚀 Deployment
Make sure [git-lfs](https://git-lfs.com/) is installed.

```bash
# Clone the repository
git clone git@github.com:TabbyML/quick-question.git

# Switch workdir
cd quick-question

# Setup environment variables
export OPENAI_API_KEY=xxx
export REPO_DIR=../../data

# Start container
docker run --rm -it -p 3000:3000 \
  -v $PWD/data:/usr/src/app/data:rw \
  -e REPO_DIR=$REPO_DIR \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  ghcr.io/tabbyml/quick-question:main
```

## 🛠️ Development
1. Make sure [git-lfs](https://git-lfs.com/) is installed.
2. Clone the repository, runs `yarn` to install dependencies.
3. Run `yarn lerna run build`.
4. Switch workdir to `./packages/quick-question`.
3. Copy `.env.sample` to `.env.local`, and set your `OPENAI_API_KEY`.
4. Run `yarn dev` to start local development server.

## 🙋 We're hiring
Come help us make TabbyML even better. We're growing fast [and would love for you to join us](https://tabbyml.notion.site/Careers-35b1a77f3d1743d9bae06b7d6d5b814a).

## ❤️ Acknowledgement

Many thanks to WizAI for contributing with [code-search](https://github.com/wizi-ai/code-search), a project that QuickQuestion branched from.
