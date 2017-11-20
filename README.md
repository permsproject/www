# permsproject.com

## 開発する

```
yarn
yarn start
open http://localhost:1313
```

`yarn start` すると `1313` ポートでサーバーが立ち上がります。

ライブリロードが有効になっているので、編集すると自動で更新されます。

## ファイル構成

### Posts

`share/content` 以下が記事コンテンツです。

ここにmdを追加すると、ヘッダのYAMLに従ってページが自動生成されます。


### Assets

Javascript、Stylesheet、画像等のアセットは `src` 以下に保存されています。

`js` と `css` はwebpackでまとめてmain.js/main.cssとしてビルドされます。

`public` 以下はトップレベルに展開されます。

`src/public/profile` 以下のファイルは下記のように、命名規則に従って自動で呼ばれるので名前やフォーマットを揃えます。

```
<img class="icon" src="/profile/${user_name}.png" />
```


### Layout

`share/layout` 以下がテンプレートのレイアウトファイルです。


## デプロイする

CircleCIでテストが通過すると勝手にデプロイされます。
