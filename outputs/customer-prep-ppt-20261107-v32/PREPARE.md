# v32準備（rootのLOCK待ち）

- v31の12冊・160頁を基にし、各冊末尾2頁を差替える。24頁を追加しない。
- 旧136頁の本文、全旧ノートと画像を保全する。v31末尾2頁のノートも当時の記録として残す。
- rootからr16のLOCK・最終registry hashを受け取るまで書き出さない。現行manifest・READMEも変更しない。

## 末尾2頁の案

1. Calendar読取（17:11:51、期待する会社所有の非primary/Tokyoカレンダーを確認）→検証GAS Webアプリv5配備（17:15、URL/実行者/アクセス設定は維持）→架空生徒の準備（開始5枚、既存3名は再読込後も変更なし）。予定作成・取消と顧客ログインは未確認。
2. 今回の顧客確認は1つのGoogleアカウントで実施予定。開発側が保護者→管理者→保護者→管理者→保護者と役割を切替え、その都度ログアウト・再ログインする。顧客確認は0/6。顧客登録・ログイン・実予約・取消は未実施。

## 根拠

- outputs/customer-ready-20261107/calendar-read-result.json とcalendar-read-pass.png
- outputs/customer-ready-20261107/gas-deployment-v5.json とgas-deployment-v5.png
- outputs/customer-ready-20261107/students-before.tsv、students-after.tsv、students-after.png

読取probeは予定を作成していない。仮ラッパーは配備前に除去済み。実際の原受入30件や顧客6件の合格に加算しない。本番未開始。

## LOCK後

r16の現行生成正本を全冊先頭ノートへ反映し、MightyLINK共通デザイン・編集可能な図形を維持する。最終PPTX再取込/全頁描画、末尾2図の実寸確認、旧136頁画素比較、ノート/画像保全、構造/配置/フォント/hash照合、独立レビュー。提案manifestと検証結果をrootへ返す。
