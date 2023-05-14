---
title: Supercharge your git exeperience - Part 1
pubDate: "May 14 2023"
description: "How to configure tooling arround git to make it easier !"
tags:
  - Git
  - Github
  - Azure DevOps
  - Husky
slug: 2023/05/14/supercharge-your-git-experience-part1
img: /assets/stock-1.jpg
img_alt: "nice abstract image"
---

## Global Azure Bootcamp - AzugFR

Every year, the Gobal Azure Bootcamp <put random blabla year>

This year, I offered a session [link goes here](), now, i'll explain a bit how it's working and let you use
my setup :-)

## Git Hooks

### What are Git Hooks ?

Git hooks are event sent by git before or after operation, like `commit`, `patch`, `push` or `pull` (and more).
You can see them inside the `.git` folder of any repo. By default, none are active but, you can configure them
, they are just scripts.

Theses hooks can help you to run some operation, without needing to run each of them manually:

- lint
- commit format validation
- run tests (units, integration or more)
- generate a changelog
- pre-format commit message
- and many more (sky is the limit)

> To know more about hooks : [Git Hooks documentation](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)

### What are the problems with hooks ?

#### They are local

As the hooks are local, every people working on the repo need to setup them:

```bash
cd $(git rev-parse --show-toplevel)/.git/hooks
echo << EOF> pre-commit
  #!/usr/bin/env bash
  echo "Hello World"
EOF
```

##### shebang

> The shebang `#!/usr/bin/env bash` is the best way to select the bash interpreter, and should work better if
> your team use different os (Windows with WSL2, macOs, Linux)

##### rev-parse

> `git --rev-parse --show-toplevel` will give you the root of the repo, it's easier for scripting ;)

##### More on manual hooks

> This article explain a bit more about it [Medium article](https://medium.com/@f3igao/get-started-with-git-hooks-5a489725c639)

#### They are scripts

Scripts are good and evil, when someone write it, it's working, but, how to maintain it?

#### Complex operation can be tricky

Using bash script can be tricky to run complex command. Of course, you can use Python or Powershell but, it will add more complexity in the process.

### How to solve this ?

There's lot of tool to help, and few years ago, I've written an article about `pre-commit` in this french post [Documentation as Code](https://etienne.deneuve.xyz/2018/06/26/documentation-as-code/). But in this post, i'll write about [Husky](https://typicode.github.io/husky/#/)

Husky is a good choice for team who use `NodeJS`, it's light and highly configurable !

#### Install `Husky`

To install `husky`, you will need a root `package.json` to save help sharing the dependencies with your beloved coworkers, you can run `npm init` or just create a basic one:

```shell
cat <<EOF>$(git rev-parse --show-toplevel)/package.json
{
  "version": "0.0.0",
  "devDependencies": {}
}
EOF
```

Now, just run :

```shell
# install as devDependencies
npm install -D husky
# create the "prepare" entry to follow the npm auto-installation
npm pkg set scripts.prepare="husky install"
# "prepare" your local computer
npm install
> prepare
> husky install

husky - Git hooks installed

up to date, audited 2 packages in 574ms

1 package is looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

Thanks to the `prepare`, every user will just have to run `npm install` to get the configuration for all husky config file.

> You need to commit the `.husky` folder, and the `package.json` to share it.

#### Basic configuration of Husky

Husky comes with a tool to add hooks, inside the `.husky` folder, so let's try it

```shell
npx husky add .husky/prepare-commit-msg "echo test from hooks"
npm i
```

Now, when you run

```shell
git add .
git commit -m 'test'
test from hooks # this come from husky
[main 5c75999] add commit
 1 file changed, 1 insertion(+)
```

> To remove it, just delete the `.husky/prepare-commit-msg` file :
>
> ```shell
> rm .husky/prepare-commit-msg
> ```

#### Make it smarter !

Using `lint-staged`, we can make `husky` smarter !

```shell
npm i -D lint-staged eslint prettier eslint-config-prettier
cat <<EOF> $(git rev-parse --show-toplevel)/.lintstagedrc.json
{
  "*.{js,ts}": "eslint --fix",
  "*.{json,md}": "prettier --write"
}
EOF
```

> `eslint` is a linter for Js/Ts with lot of plugins (support for JSX, Astro and many)
> `prettier` is a formatter for Js/Ts etc...
> `eslint-config-prettier` is a preset to make eslint and prettier happy together

Let's try lint-staged alone to avoid issue in `husky` before adding it :

```shell
git add .
npx lint-staged
✔ Preparing lint-staged...
✔ Running tasks for staged files...
✔ Applying modifications from tasks...
✔ Cleaning up temporary files...
```

Now we can add it inside `husky` config using :

```shell
npx husky add .husky/pre-commit "npx lint-staged"
npm i
git add .
git commit
✔ Preparing lint-staged...
✔ Running tasks for staged files...
✔ Applying modifications from tasks...
✔ Cleaning up temporary files...
```

et _voilà_

In the next articles i'll go deeper in this configuration :)

Stay Tuned!
