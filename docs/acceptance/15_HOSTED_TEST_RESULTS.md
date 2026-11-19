> 2026-10-22 アカウント運用変更：初期接続・初期管理者は開発担当、日常のGoogleアカウント登録・停止・削除・生徒紐付け・家庭URL再発行は管理者画面で行う。[現行仕様](../ACCOUNT_MANAGEMENT.md)を優先。Calendar未追加・本番未開始。

# 公開環境・画面キャプチャ付き受入結果（DOC-PUB-RESULT-001）

> 2026-10-21 設定進捗：FirebaseのWebアプリ登録・Google認証有効化・検証ドメイン保存と、検証GASの対象台帳操作・外部通信の承認を確認しました。本人UID登録と実Googleログイン、新GASのデプロイ・新サイトへの切替は未完了です。Calendarは未追加。本番運用は開始していません。[Step 08](../progress/2026-10-21-step-08.md)を参照。


> 2026-10-21仕様追補（未公開）: [開発者セットアップ・Google本人確認](../DEVELOPER_SETUP_OVERVIEW.md)を追加します。旧キー方式の結果は過去版の記録です。新方式のローカル試験と実Google・公開確認を分け、AT-24〜30の7件は未合格を維持します。

> 現行仕様（2026-10-20追加）: [管理者・家庭別ポータル／個別URL・QR](../PORTAL_SEPARATION.md)と[Step 06](../progress/2026-10-20-step-06.md)を優先してください。以下の旧実行結果は当時の版の記録です。現在はAT-23 PASS、AT-24〜30の7件未合格。新仕様の補足試験はGAS42件・フロント契約9件・実API読み取り11件を別集計し、元の30受入項目へ加算しません。

文書版: 2026-10-20 / マイティのテスト公開版。

公開版 **deed2fc3d9a96297**、実行UTC 2026-10-19T17:00:52.049Z〜2026-10-19T17:01:44.162Z（日本時間は+9時間）。**PASS 23 / FAIL 0 / 未実施 0、全23件、画面40枚**。

[不変の結果JSON](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/results.json) / [実行時テストコード](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/runner.cjs) / [配信版・権限](13_MIGHTY_TEST_DEPLOYMENT.md)。

デモデータでの公開画面操作、およびブラウザ内に限定した通信障害の模擬試験。実Google連携の成功を意味しない。

| 配信資産 | HTTP | SHA-256 |
| --- | --- | --- |
| https://eigo-taxi-test.web.app/ | 200 | 5a876f48b3f9e38bcfaef1f92082fc420f5852eb7fc1a46ee06baa272a7f73a5 |
| https://eigo-taxi-test.web.app/assets/index-Cdm9WCYn.css | 200 | 9c9117dae302a11442a9fd8c7b086d85ec8eb173c2cbb0ecdd32c1da2e0485bb |
| https://eigo-taxi-test.web.app/assets/index-D3vzjXr_.js | 200 | 17ec754679e22124dec4bb996a6fda4d0ac42c7670c4ca6e9253942138dfa8fe |
| https://eigo-taxi-test.web.app/?student=STU-002 | 200 | 5a876f48b3f9e38bcfaef1f92082fc420f5852eb7fc1a46ee06baa272a7f73a5 |

<a id="PUB-01"></a>
## PUB-01: 未認証の公開ページ — PASS

関連: [AT-19](06_ACCEPTANCE_TEST_SPEC.md#AT-19), [AT-30](06_ACCEPTANCE_TEST_SPEC.md#AT-30) / [仕様](14_HOSTED_TEST_SPEC.md)。

範囲: UI visibility only; no direct service authorization assertion。方式: hosted-ui-synthetic-demo。

実測: Assertions passed through the deployed UI within the explicitly described scope.

![PUB-01 PUB-01-result.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-01-result.png)

SHA-256: f775f9d1b4d9603d157b011f4efb464ac6960c0273b301403284503e9faf0f3a

<a id="PUB-02"></a>
## PUB-02: studentクエリでは認証を迂回しない — PASS

関連: [AT-19](06_ACCEPTANCE_TEST_SPEC.md#AT-19), [AT-20](06_ACCEPTANCE_TEST_SPEC.md#AT-20) / [仕様](14_HOSTED_TEST_SPEC.md)。

範囲: Query URL and parent UI only。方式: hosted-ui-synthetic-demo。

実測: Assertions passed through the deployed UI within the explicitly described scope.

![PUB-02 PUB-02-unauthenticated-query.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-02-unauthenticated-query.png)

SHA-256: f775f9d1b4d9603d157b011f4efb464ac6960c0273b301403284503e9faf0f3a

![PUB-02 PUB-02-result.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-02-result.png)

SHA-256: 336985bc1dfc709778e298d192e1916e191959c54a208014fb4474c623139478

<a id="PUB-03"></a>
## PUB-03: 明示した保護者デモの家庭・残高表示 — PASS

関連: [AT-03](06_ACCEPTANCE_TEST_SPEC.md#AT-03), [AT-20](06_ACCEPTANCE_TEST_SPEC.md#AT-20) / [仕様](14_HOSTED_TEST_SPEC.md)。

範囲: Synthetic STU-001 UI; live family authorization remains external。方式: hosted-ui-synthetic-demo。

実測: Assertions passed through the deployed UI within the explicitly described scope.

![PUB-03 PUB-03-result.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-03-result.png)

SHA-256: 336985bc1dfc709778e298d192e1916e191959c54a208014fb4474c623139478

<a id="PUB-04"></a>
## PUB-04: ログアウトと管理者・保護者の切替 — PASS

関連: [AT-19](06_ACCEPTANCE_TEST_SPEC.md#AT-19), [AT-20](06_ACCEPTANCE_TEST_SPEC.md#AT-20) / [仕様](14_HOSTED_TEST_SPEC.md)。

範囲: Fresh demo sessions, UI visibility and session state。方式: hosted-ui-synthetic-demo。

実測: Assertions passed through the deployed UI within the explicitly described scope.

![PUB-04 PUB-04-logged-out.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-04-logged-out.png)

SHA-256: f775f9d1b4d9603d157b011f4efb464ac6960c0273b301403284503e9faf0f3a

![PUB-04 PUB-04-result.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-04-result.png)

SHA-256: 3170fb5611c7f90e6fcae968360be220e83d4c6d4b72789e34f64bf0aa40c963

<a id="PUB-05"></a>
## PUB-05: 画面から架空生徒を登録 — PASS

関連: [AT-02](06_ACCEPTANCE_TEST_SPEC.md#AT-02) / [仕様](14_HOSTED_TEST_SPEC.md)。

範囲: Demo UI and saved synthetic data。方式: hosted-ui-synthetic-demo。

実測: Assertions passed through the deployed UI within the explicitly described scope.

![PUB-05 PUB-05-result.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-05-result.png)

SHA-256: 00d0b5aa6ff389396d351e55cee88b4dcbf1be5c36bc31ed6a00c2f95f82f675

<a id="PUB-06"></a>
## PUB-06: 画面から10回券を追加 — PASS

関連: [AT-05](06_ACCEPTANCE_TEST_SPEC.md#AT-05) / [仕様](14_HOSTED_TEST_SPEC.md)。

範囲: Demo UI, balance and persisted purchase fields。方式: hosted-ui-synthetic-demo。

実測: Assertions passed through the deployed UI within the explicitly described scope.

![PUB-06 PUB-06-result.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-06-result.png)

SHA-256: de19807b126ad3f7d56f1fdb6e6a9ee2ec667f0e57d9c854c8987f4dc1ccd1b1

<a id="PUB-07"></a>
## PUB-07: 保護者が画面からお迎え予約 — PASS

関連: [AT-06](06_ACCEPTANCE_TEST_SPEC.md#AT-06) / [仕様](14_HOSTED_TEST_SPEC.md)。

範囲: Real form submit, demo storage and visible reservation; no external calendar。方式: hosted-ui-synthetic-demo。

実測: Assertions passed through the deployed UI within the explicitly described scope.

![PUB-07 PUB-07-result.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-07-result.png)

SHA-256: 913a58aa76f1ba7c73105005a3166e8684661e5c691d8897f33ae1338e0af419

<a id="PUB-08"></a>
## PUB-08: 保護者が画面から送り予約 — PASS

関連: [AT-07](06_ACCEPTANCE_TEST_SPEC.md#AT-07) / [仕様](14_HOSTED_TEST_SPEC.md)。

範囲: Real form submit, demo storage and visible reservation; no external calendar。方式: hosted-ui-synthetic-demo。

実測: Assertions passed through the deployed UI within the explicitly described scope.

![PUB-08 PUB-08-result.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-08-result.png)

SHA-256: e6fa161a41f9f8071f9bc7df64b149aa9ad6e2618bdbd25744b4da99ef4af8ec

<a id="PUB-09"></a>
## PUB-09: 保護者が画面から往復予約 — PASS

関連: [AT-08](06_ACCEPTANCE_TEST_SPEC.md#AT-08) / [仕様](14_HOSTED_TEST_SPEC.md)。

範囲: Real form submit, demo storage and visible reservation; no external calendar。方式: hosted-ui-synthetic-demo。

実測: Assertions passed through the deployed UI within the explicitly described scope.

![PUB-09 PUB-09-result.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-09-result.png)

SHA-256: aebe1ee524314c8ba8519d43f43acc49ea2c0c22ac64be2b006587532047d0cc

<a id="PUB-10"></a>
## PUB-10: 管理者予約者属性をセッションから決定 — PASS

関連: [AT-09](06_ACCEPTANCE_TEST_SPEC.md#AT-09) / [仕様](14_HOSTED_TEST_SPEC.md)。

範囲: Admin form and admin visiting parent tab both persist reservedBy=teacher。方式: hosted-ui-synthetic-demo。

実測: Assertions passed through the deployed UI within the explicitly described scope.

![PUB-10 PUB-10-result.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-10-result.png)

SHA-256: 7f8d1c3ae17e7f7cdf41606ef1e84c082a00f1db10a9d827defb96ec69c63edf

<a id="PUB-11"></a>
## PUB-11: 保護者の取消確認・取消後表示 — PASS

関連: [AT-10](06_ACCEPTANCE_TEST_SPEC.md#AT-10), [AT-16](06_ACCEPTANCE_TEST_SPEC.md#AT-16) / [仕様](14_HOSTED_TEST_SPEC.md)。

範囲: Confirmation dismiss/accept and canceled UI; not direct-call rejection proof。方式: hosted-ui-synthetic-demo。

実測: Assertions passed through the deployed UI within the explicitly described scope.

![PUB-11 PUB-11-result.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-11-result.png)

SHA-256: 208fd8e7c20bc72c55d5caf85fbe89b21ecadbcd45f5fb72eddd7c9a7d4486f0

<a id="PUB-12"></a>
## PUB-12: 管理者取消と取消後の操作非表示 — PASS

関連: [AT-11](06_ACCEPTANCE_TEST_SPEC.md#AT-11), [AT-16](06_ACCEPTANCE_TEST_SPEC.md#AT-16) / [仕様](14_HOSTED_TEST_SPEC.md)。

範囲: UI cancel and no completion/cancel buttons on canceled row; not server rejection proof。方式: hosted-ui-synthetic-demo。

実測: Assertions passed through the deployed UI within the explicitly described scope.

![PUB-12 PUB-12-result.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-12-result.png)

SHA-256: 929a5ee4bbabe3fa42cc39e47db505f742f51067e8962c6befb9ae05cc4e6e62

<a id="PUB-13"></a>
## PUB-13: 当日の一覧とGoogle地図リンク — PASS

関連: [AT-12](06_ACCEPTANCE_TEST_SPEC.md#AT-12) / [仕様](14_HOSTED_TEST_SPEC.md)。

範囲: URL construction only; Maps destination is not opened。方式: hosted-ui-synthetic-demo。

実測: Assertions passed through the deployed UI within the explicitly described scope.

![PUB-13 PUB-13-result.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-13-result.png)

SHA-256: 5f684110ed7b3c0db3a646ec9ba4d3361673a3e0ffebdb1328218e1c919205de

<a id="PUB-14"></a>
## PUB-14: 管理者が片道を完了 — PASS

関連: [AT-13](06_ACCEPTANCE_TEST_SPEC.md#AT-13), [AT-15](06_ACCEPTANCE_TEST_SPEC.md#AT-15) / [仕様](14_HOSTED_TEST_SPEC.md)。

範囲: UI completed state, ticket consumption and hidden repeat button; not direct replay/server lock proof。方式: hosted-ui-synthetic-demo。

実測: Assertions passed through the deployed UI within the explicitly described scope.

![PUB-14 PUB-14-result.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-14-result.png)

SHA-256: db6d861d7ea0c64ed551419c710c23df10d36d73304c7f0a6132156447896e54

<a id="PUB-15"></a>
## PUB-15: 管理者が往復を完了 — PASS

関連: [AT-14](06_ACCEPTANCE_TEST_SPEC.md#AT-14), [AT-15](06_ACCEPTANCE_TEST_SPEC.md#AT-15) / [仕様](14_HOSTED_TEST_SPEC.md)。

範囲: UI completed state, ticket consumption and hidden repeat button; not direct replay/server lock proof。方式: hosted-ui-synthetic-demo。

実測: Assertions passed through the deployed UI within the explicitly described scope.

![PUB-15 PUB-15-result.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-15-result.png)

SHA-256: b89f71f77fc5d914dccfc322806d9372d9ba1d5d9b4ab7d939989b8b0ff89707

<a id="PUB-16"></a>
## PUB-16: 必須項目の空欄を送信しない — PASS

関連: [AT-02](06_ACCEPTANCE_TEST_SPEC.md#AT-02), [AT-06](06_ACCEPTANCE_TEST_SPEC.md#AT-06) / [仕様](14_HOSTED_TEST_SPEC.md)。

範囲: Native form validation for student name and pickup location。方式: hosted-ui-synthetic-demo。

実測: Assertions passed through the deployed UI within the explicitly described scope.

![PUB-16 PUB-16-student-required.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-16-student-required.png)

SHA-256: c820228d04cc94eb69bc5f19fa2a693c1f31c6d4653341ae2275c9d5251bc1fe

![PUB-16 PUB-16-result.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-16-result.png)

SHA-256: 6f36b7531adf9a3a0361d982647fca4ab2bf8946ba4842be179ab2a770133899

<a id="PUB-17"></a>
## PUB-17: 画面で不正なチケット枚数・金額を拒否 — PASS

関連: [AT-17](06_ACCEPTANCE_TEST_SPEC.md#AT-17) / [仕様](14_HOSTED_TEST_SPEC.md)。

範囲: UI-representable invalid numbers only; NaN/Infinity/direct service calls are not covered。方式: hosted-ui-synthetic-demo。

実測: Assertions passed through the deployed UI within the explicitly described scope.

![PUB-17 PUB-17-result.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-17-result.png)

SHA-256: 394aad978ee4830dc61cc20280a825a885043b054d81c6156e8307b241cf7b63

<a id="PUB-18"></a>
## PUB-18: 375pxで管理・保護者・予約フォームを表示 — PASS

関連: [AT-21](06_ACCEPTANCE_TEST_SPEC.md#AT-21) / [仕様](14_HOSTED_TEST_SPEC.md)。

範囲: Headless Chromium emulation; not iPhone Safari or Android device acceptance。方式: hosted-ui-synthetic-demo。

実測: Assertions passed through the deployed UI within the explicitly described scope.

![PUB-18 PUB-18-teacher.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-18-teacher.png)

SHA-256: 1bba42e8a4ca30a089c790b24a69b9dd4e335cf992c7b702ce9901f89d1ed7fe

![PUB-18 PUB-18-parent.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-18-parent.png)

SHA-256: 0dc8abcc8ebbfbadb1e6ca1f72d3f3dca8f4d30f2650b2bcb5d5a5a6a17d258f

![PUB-18 PUB-18-booking.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-18-booking.png)

SHA-256: 142b89983ad09dbebe709399f66f8a28600e2eb75295db8dcc671f5053409260

![PUB-18 PUB-18-result.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-18-result.png)

SHA-256: 8778e721445721192cd34c49b5471f9ba0624e66cb6f70391fb3c1bd2390511f

<a id="PUB-19"></a>
## PUB-19: 生徒・予約の再読込後の永続化 — PASS

関連: [AT-22](06_ACCEPTANCE_TEST_SPEC.md#AT-22) / [仕様](14_HOSTED_TEST_SPEC.md)。

範囲: Same isolated browser demo storage only, not cross-device/Google persistence。方式: hosted-ui-synthetic-demo。

実測: Assertions passed through the deployed UI within the explicitly described scope.

![PUB-19 PUB-19-student.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-19-student.png)

SHA-256: 577411af0a9c8fb19fd22b12a02a8e805bdb873bf597f5f549896e412a45802e

![PUB-19 PUB-19-result.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-19-result.png)

SHA-256: 52da562bcaee8f5df420688663c0504251bd0d1e49f5c7b6bea914f3b2f7e48d

<a id="PUB-20"></a>
## PUB-20: 設定保存でデモから実接続へ自動切替しない — PASS

関連: [AT-01](06_ACCEPTANCE_TEST_SPEC.md#AT-01) / [仕様](14_HOSTED_TEST_SPEC.md)。

範囲: Synthetic endpoint saved without contact; explicit login still required。方式: hosted-ui-synthetic-demo。

実測: Assertions passed through the deployed UI within the explicitly described scope.

![PUB-20 PUB-20-result.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-20-result.png)

SHA-256: 56eb4088e77ca51e0b9c7a4448b73ab66d9457a9236802392e626bee758f11ef

<a id="PUB-21"></a>
## PUB-21: 実際のデモ完了操作で残高2・1・0の案内 — PASS

関連: [AT-04](06_ACCEPTANCE_TEST_SPEC.md#AT-04) / [仕様](14_HOSTED_TEST_SPEC.md)。

範囲: Synthetic UI operations create each balance; no storage seeding。方式: hosted-ui-synthetic-demo。

実測: Assertions passed through the deployed UI within the explicitly described scope.

![PUB-21 PUB-21-balance-2.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-21-balance-2.png)

SHA-256: 62b30298877f998e869a869105b4eed5d5ad855f4fbb40658cd031e4271f3607

![PUB-21 PUB-21-balance-1.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-21-balance-1.png)

SHA-256: 248dee799cf7fdb16ec041e952815fcdbc1ac5e0a7706b490d7be1c47cbe0a9c

![PUB-21 PUB-21-balance-0.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-21-balance-0.png)

SHA-256: 238177bbfe185828e1bed396ae20dbc0645dc3c59b69829cdef48aae2dba5f51

![PUB-21 PUB-21-result.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-21-result.png)

SHA-256: c323d94b05ce2ad569a0a9f65377e35d6796f723089b534cf3c9b2e6e7101de0

<a id="PUB-22"></a>
## PUB-22: 模擬HTTPS障害で各更新を成功扱いしない — PASS

関連: [AT-18](06_ACCEPTANCE_TEST_SPEC.md#AT-18) / [仕様](14_HOSTED_TEST_SPEC.md)。

範囲: UI-only mock at acceptance.invalid; no real GAS/Google requests; all five mutation types and retry ID。方式: hosted-ui-with-mocked-https。

実測: Assertions passed through the deployed UI within the explicitly described scope.

![PUB-22 PUB-22-reservation-failure.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-22-reservation-failure.png)

SHA-256: cafcff062a13afdd1efa19c65bececc4f734a7f206d227df68129dcd7aadbeda

![PUB-22 PUB-22-tickets-abort.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-22-tickets-abort.png)

SHA-256: f934f4b0a63adb7d321a997967db3bb36b619c51005b78f2353f514f1a8bc98c

![PUB-22 PUB-22-tickets-http.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-22-tickets-http.png)

SHA-256: b9b4672daa5eafb7fbee327d678d74b55b5cf00f63b251f748405a65a6fdbddb

![PUB-22 PUB-22-tickets-json.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-22-tickets-json.png)

SHA-256: 2a8870dd6b459acca4c9dffa174c674d68be90bc1b2cbac2fd81bd7d33bd38c1

![PUB-22 PUB-22-tickets-response.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-22-tickets-response.png)

SHA-256: ad343b82e342515148aaaa1ee33c14420fb0d7aad7d0fb03d6150730fe31dc9e

![PUB-22 PUB-22-student-failure.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-22-student-failure.png)

SHA-256: fc8985edf054fbc05c5d80211f26ce248881bc3312a41f913804cf001b2e00e6

![PUB-22 PUB-22-complete-failure.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-22-complete-failure.png)

SHA-256: e006064f0e8cd7235e86b368d6ab172fd8c00b2f5005f269fc52b2ad344f44ff

![PUB-22 PUB-22-result.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-22-result.png)

SHA-256: 91e66db8c1686eabef67df4ed43a7dfb571e234867ac70e0b946ea381dd68546

<a id="PUB-23"></a>
## PUB-23: 模擬認証失効応答でログイン画面へ戻る — PASS

関連: [AT-19](06_ACCEPTANCE_TEST_SPEC.md#AT-19) / [仕様](14_HOSTED_TEST_SPEC.md)。

範囲: Mock UNAUTHORIZED response through genuine UI; real identity provider remains untested。方式: hosted-ui-with-mocked-https。

実測: Assertions passed through the deployed UI within the explicitly described scope.

![PUB-23 PUB-23-result.png](hosted-runs/2026-10-19T17-00-52-047Z-264bbd/PUB-23-result.png)

SHA-256: 028b9a4ece79387812500537c1ceff772be18c38161177ddd8c98845c9ebc175

## 残課題・リリース条件

| 関連受入 | 未確認範囲 |
| --- | --- |
| [AT-15](06_ACCEPTANCE_TEST_SPEC.md#AT-15), [AT-16](06_ACCEPTANCE_TEST_SPEC.md#AT-16), [AT-17](06_ACCEPTANCE_TEST_SPEC.md#AT-17), [AT-19](06_ACCEPTANCE_TEST_SPEC.md#AT-19), [AT-20](06_ACCEPTANCE_TEST_SPEC.md#AT-20) | Hosted UI observations do not replace direct service authorization, duplicate-request/idempotency and malformed-value regression tests. |
| [AT-18](06_ACCEPTANCE_TEST_SPEC.md#AT-18) | Faults are intercepted at acceptance.invalid in this browser. No real GAS outage, concurrent request or external service was exercised. |
| [AT-23](06_ACCEPTANCE_TEST_SPEC.md#AT-23), [AT-24](06_ACCEPTANCE_TEST_SPEC.md#AT-24), [AT-25](06_ACCEPTANCE_TEST_SPEC.md#AT-25), [AT-26](06_ACCEPTANCE_TEST_SPEC.md#AT-26), [AT-27](06_ACCEPTANCE_TEST_SPEC.md#AT-27), [AT-28](06_ACCEPTANCE_TEST_SPEC.md#AT-28) | Requires explicitly isolated Google Sheets/GAS/Calendar resources, configured credentials, multi-session or backup execution; not attempted by this hosted UI suite. |
| [AT-29](06_ACCEPTANCE_TEST_SPEC.md#AT-29) | Requires physical iPhone Safari / Android Chrome and human acceptance; Chromium mobile emulation is partial evidence only. |
| [AT-30](06_ACCEPTANCE_TEST_SPEC.md#AT-30) | This is test-hosting UI smoke and served-asset evidence, not full production release acceptance; external integration and release prerequisites remain independent. |

必要な対応: 専用Google Sheets/CalendarとGASを用意し認証・家庭別割当を設定 → 実接続と複数セッション・バックアップ復元のAT-23〜28 → 実iPhone/Androidと担当者受入AT-29 → 業務基準・運用窓口を合意 → 本番公開後AT-30。テストサイト公開済み、業務運用のリリース判定は保留。



