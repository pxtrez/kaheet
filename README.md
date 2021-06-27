# Kaheet

Kaheet is a free kahoot cheat made by [pxtrez](https://gihub.com/pxtrez)

## How to use?

To use the cheat, you need to enter the quiz ID. You can type it or search for it using [quiz name](#Get-quiz-name)

### Get quiz name

1. Join Kahoot Game
2. Open console and paste script:

```ts
fetch("http://kaheet.herokuapp.com/kaheet/script/find")
.then((r) => r.text()
.then((t) => eval(t)))
```

3. Enter your quiz name and copy the quiz ID you need
4. Paste [this](#Cheat) script

### Cheat

1. Join Kahoot Game
2. Open console and paste script:

```ts
fetch("http://kaheet.herokuapp.com/kaheet/script/cheat")
.then((r) => r.text()
.then((t) => eval(t)))
```

3. Then enter the quiz ID.

* Wrong answers should be darker than the correct ones.

![image](./docs/example.png)
