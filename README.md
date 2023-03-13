## ⁉️ QuickQuestion
![Docker build status](https://img.shields.io/github/actions/workflow/status/TabbyML/quick-question/docker.yml)

> **Warning**
> This is work in progress, it is not a production ready solution.

## 🤔 What is this?

An incubating AI-powered stackoverflow for your codebase, by [TabbyML](https://tabbyml.com)

[Live Demo for huggingface/diffusers](https://quick-question.vercel.app)

![Example Quick Question](example-quick-question.png)

## 📖 Development
1. Make sure [git-lfs](https://git-lfs.com/) is installed.
2. Clone the repository, runs `yarn` to install dependencies.
3. Copy `.env.sample` to `.env.local`, and set your `OPENAI_API_KEY`.
4. Run `yarn dev` to start local development server.

## 💁 Acknowledgement

Many thanks to WizAI for contributing with [code-search](https://github.com/wizi-ai/code-search), a project that QuickQuestion branched from.
