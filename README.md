## ⁉️ QuickQuestion
![Docker build status](https://img.shields.io/github/actions/workflow/status/TabbyML/quick-question/docker.yml)

> **Warning**
> This is work in progress, it is not a production ready solution.

## 🤔 What is this?

An incubating AI-powered stackoverflow for your codebase, by [TabbyML](https://tabbyml.com)

[Live Demo for huggingface/diffusers](https://quick-question.vercel.app)

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
export REPO_DIR=data/diffusers

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
3. Copy `.env.sample` to `.env.local`, and set your `OPENAI_API_KEY`.
4. Run `yarn dev` to start local development server.

## 💁 Acknowledgement

Many thanks to WizAI for contributing with [code-search](https://github.com/wizi-ai/code-search), a project that QuickQuestion branched from.
