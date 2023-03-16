## ⁉️ QuickQuestion
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
![Docker build status](https://img.shields.io/github/actions/workflow/status/TabbyML/quick-question/docker.yml?label=docker%20image%20build)

> **Warning**
> This is work in progress, it is not a production ready solution.

## 🤔 What is this?

An incubating AI-powered Q&A for your codebase.
[Live Demo for huggingface/diffusers](https://quick-question.fly.dev/huggingface/diffusers)

![Example Quick Question](example-quick-question.png)

## 🚀 Deployment
Make sure [git-lfs](https://git-lfs.com/) is installed.

```bash
# Clone the repository
git clone https://github.com/TabbyML/quick-question

# Save your OPENAI_API_KEY to file as secret
echo YOUR_OPENAI_API_KEY > openai_api_key.txt

# Start container
docket-compose up
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
