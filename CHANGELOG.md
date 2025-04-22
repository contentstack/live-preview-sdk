# Changelog

## [v3.2.0](https://github.com/contentstack/live-preview-sdk/compare/v3.2.0...v3.2.0)

> 11 April 2025

### New Features

- feat(collab): add ui-components and collab feature handling (MohammedZuhairAhmed - [fa4daee](https://github.com/contentstack/live-preview-sdk/commit/fa4daee7c4d745b0ea0a2423667226698728f3fb))
- feat(collab): open popup from rhs panel (MohammedZuhairAhmed - [e0ca1c2](https://github.com/contentstack/live-preview-sdk/commit/e0ca1c2b20d5b68f4ca49fef8c566ce62a0e0765))
- feat(collab): add env based tree-shaking (MohammedZuhairAhmed - [33acd25](https://github.com/contentstack/live-preview-sdk/commit/33acd2517d0823aab0ca12fee99e75b94302c46e))
- feat(collab): add retry mechanism for thread rendering (MohammedZuhairAhmed - [7f3b724](https://github.com/contentstack/live-preview-sdk/commit/7f3b724aef822c48b6383ce43d03e906c677b1bf))
- feat(collab): pause collab mode in preview share (MohammedZuhairAhmed - [ae12b58](https://github.com/contentstack/live-preview-sdk/commit/ae12b587f44661d8797dcc62e95cbaae7baf9335))
- feat(collab): delete thread when no comments present (Pratyush Biswas - [67a668d](https://github.com/contentstack/live-preview-sdk/commit/67a668dd330851073fef3240743d55e9545494b3))
- feat: updates (Ashish Debnath - [1a2db18](https://github.com/contentstack/live-preview-sdk/commit/1a2db187daea2ec7307b12c0c8e52eae97aadf3f))

### Fixes

- fix(collab): addressed PR comments (MohammedZuhairAhmed - [d57c2b3](https://github.com/contentstack/live-preview-sdk/commit/d57c2b3d3ca6d2b1d5d13965c77ef9b5c568696b))
- fix(collab): stop event propagation of modals in collab mode and bug fixes (MohammedZuhairAhmed - [24c5a8b](https://github.com/contentstack/live-preview-sdk/commit/24c5a8b0f720dd171c87e679ee70a6d337975107))
- fix(collab): disable buttons and icons until api processing is completed, add asyncloader component (MohammedZuhairAhmed - [f0214a5](https://github.com/contentstack/live-preview-sdk/commit/f0214a5ab05c4a4f79aac9dee1261331356df1a1))
- fix(collab): bug fixes and code optimisations (MohammedZuhairAhmed - [94bca65](https://github.com/contentstack/live-preview-sdk/commit/94bca658d6fc963b361220de987a9b2510ea5af9))
- fix(collab): addressed pr comments (MohammedZuhairAhmed - [94fc6cf](https://github.com/contentstack/live-preview-sdk/commit/94fc6cfa657a5dd5095ed644abeb6cce4e8d5276))
- fix(collab): re-design of indicator and api changes (MohammedZuhairAhmed - [d37270c](https://github.com/contentstack/live-preview-sdk/commit/d37270ce0ae21b4cdc111a0e06d4102592bddb9e))
- fix(collab): user tagging enhancements (diwakarmk7 - [1315762](https://github.com/contentstack/live-preview-sdk/commit/1315762472492eb81bf175b8e2b4a466c7088665))
- fix: add check for list overflow (Pratyush Biswas - [cd8f6eb](https://github.com/contentstack/live-preview-sdk/commit/cd8f6eb5d0642b6578d324d6f25a6f5ba803391e))
- fix(collab): highlight comment icon fix and code optimization (MohammedZuhairAhmed - [67d698e](https://github.com/contentstack/live-preview-sdk/commit/67d698e1b29c27c07360af09ba3ad5f9403deb28))
- fix: update field event is not sent when input event does not occur in inline editable fields (Faraaz Biyabani - [f57744e](https://github.com/contentstack/live-preview-sdk/commit/f57744e1e5bbf77257ce2dee8c26548780c81069))
- fix(collab): user tagging fix (MohammedZuhairAhmed - [27167c7](https://github.com/contentstack/live-preview-sdk/commit/27167c713552976836a4c5b61f4779659e6a0abb))
- fix: threead position changes (Ashish Debnath - [fed3264](https://github.com/contentstack/live-preview-sdk/commit/fed3264ae8ccf416c16da7d3d751c59a8611d093))
- fix(collab): added listener for new threads updated from state and bug fixes (MohammedZuhairAhmed - [1274bc3](https://github.com/contentstack/live-preview-sdk/commit/1274bc37e90f843761b1d653660d62c52786a00f))
- fix(collab): made the inviteMetada to be updated when refreshed to get new comments (MohammedZuhairAhmed - [4f2f441](https://github.com/contentstack/live-preview-sdk/commit/4f2f44159f8d7898fd117cf7ab18f7783b7e6560))
- fix(chore): add validations in textarea (Pratyush Biswas - [c130916](https://github.com/contentstack/live-preview-sdk/commit/c130916a7443742644e307814909979b5c522808))
- fix(collab): fix bugs (MohammedZuhairAhmed - [d058d90](https://github.com/contentstack/live-preview-sdk/commit/d058d90eee063f828bc38d26fd40e5bd351eac55))
- fix: updates (Ashish Debnath - [e6326b3](https://github.com/contentstack/live-preview-sdk/commit/e6326b3675bef9a835dd23a46f07640a6524bb7b))
- fix(collab): address pr reviews (MohammedZuhairAhmed - [c5d9325](https://github.com/contentstack/live-preview-sdk/commit/c5d93252703b175152afe225e642608863c35ecb))
- fix: test cae (Ashish Debnath - [a24e589](https://github.com/contentstack/live-preview-sdk/commit/a24e589e7de5da1d4b0880a004cda365cb7fde44))
- fix(collab): remove unused styles (Pratyush Biswas - [e5acea6](https://github.com/contentstack/live-preview-sdk/commit/e5acea6ccda9f44e39f6d26f6836064f2089d70e))
- fix(collab): fix cursor when hovering on popup (Pratyush Biswas - [9b288dc](https://github.com/contentstack/live-preview-sdk/commit/9b288dc65150e4596bbc9e125fb34f9894d15805))
- fix: updates (Ashish Debnath - [469e98c](https://github.com/contentstack/live-preview-sdk/commit/469e98cbec8e5e3d99bb9391f72e89dd31932b84))
- fix(collab): remove debugging elements (Pratyush Biswas - [752429b](https://github.com/contentstack/live-preview-sdk/commit/752429b343e40d033cf21f0efb23d9c648d79bdb))

### Chores And Housekeeping

- chore(collab): addressed pr comments (MohammedZuhairAhmed - [889a810](https://github.com/contentstack/live-preview-sdk/commit/889a810cccb7cf347253077eb5bdb27184c27e1a))
- chore(collab): fix email styles (Pratyush Biswas - [0f979de](https://github.com/contentstack/live-preview-sdk/commit/0f979de6e654332bde33fb8bc88d68469343ed29))

### Refactoring and Updates

- refactor(collab): addressed pr comments (MohammedZuhairAhmed - [2594bfc](https://github.com/contentstack/live-preview-sdk/commit/2594bfce49d18d44eeaa0312b0ba4d0afd1bc4ab))
- refactor(collab): code optimisation and bug fixes (MohammedZuhairAhmed - [aad0e61](https://github.com/contentstack/live-preview-sdk/commit/aad0e61d42410284f053c151b9b76866b3d85381))
- refactor(collab): addressed pr feedbacks (MohammedZuhairAhmed - [ad53532](https://github.com/contentstack/live-preview-sdk/commit/ad53532116e8c57986f38bc290121c91540bbdc4))

### Changes to Test Assests

- test(collab): test cases addition and config updates (MohammedZuhairAhmed - [01bb128](https://github.com/contentstack/live-preview-sdk/commit/01bb1281cc206b67b2394c876b82903090fdaf86))
- test(collab): add ui-components test cases (MohammedZuhairAhmed - [e0540ec](https://github.com/contentstack/live-preview-sdk/commit/e0540eced5f0ae89a71d363e160e6d79589f9844))
- test(collab): fix failing test cases (Pratyush Biswas - [827d28c](https://github.com/contentstack/live-preview-sdk/commit/827d28ce814e6b97e2597185680809892b0a080e))
- test(collab): add test cases for deleting thread when no comments (Pratyush Biswas - [ad95401](https://github.com/contentstack/live-preview-sdk/commit/ad9540156bb665199ae6d047c929f3f11f82aad9))
- test(collab): added test cases (MohammedZuhairAhmed - [f02d09e](https://github.com/contentstack/live-preview-sdk/commit/f02d09e84b7651f3fa3ae85404e64ee8e6a59083))
- test(collab): add corresponding test cases (Pratyush Biswas - [0b34034](https://github.com/contentstack/live-preview-sdk/commit/0b340341d1e58afdb6c2c2c51a0c1637cb8612b8))
- test: update focusOverlayWrapper test (Faraaz Biyabani - [fb53c5e](https://github.com/contentstack/live-preview-sdk/commit/fb53c5edde64dc9d4474e019e75d1f38590e10b9))

### General Changes

- tagging changes (diwakarmk7 - [266b495](https://github.com/contentstack/live-preview-sdk/commit/266b4951dcd9c8b61b564498eec7c12cf5dc55c9))
- tagging users (diwakarmk7 - [0572101](https://github.com/contentstack/live-preview-sdk/commit/0572101e26057be942c992966b398743ae661528))
- Revert "fix: update field event is not sent when input event does not occur in inline editable fields" (Faraaz Biyabani - [9180f84](https://github.com/contentstack/live-preview-sdk/commit/9180f84a1eaebb8179f2a766c310fb967fc48214))
- Fix thread popup styles (Pratyush Biswas - [c7ed7a3](https://github.com/contentstack/live-preview-sdk/commit/c7ed7a393cf063a7706e2423fad3d4b62a9ab9bb))
- suggestion scroll movement fix (diwakarmk7 - [2b3fef6](https://github.com/contentstack/live-preview-sdk/commit/2b3fef6a5b20395f64917f9742639386197ed701))
- disable button changes (diwakarmk7 - [1d224a6](https://github.com/contentstack/live-preview-sdk/commit/1d224a6316db3baf1ebb53157a82a06448acea1b))
- added disabled state for adding comment button (diwakarmk7 - [623163f](https://github.com/contentstack/live-preview-sdk/commit/623163f547b418e0049e04a2d2c662a1eea1154b))
- tagging changes (diwakarmk7 - [1046ab6](https://github.com/contentstack/live-preview-sdk/commit/1046ab6f8845280c6c206d870241163bc5cbbc4a))
- remove unused styles (Pratyush Biswas - [4288126](https://github.com/contentstack/live-preview-sdk/commit/42881260812aaede2ce38ba6d73e4ae1b7c71d22))
- Fix resolve button style (Pratyush Biswas - [d9f5eea](https://github.com/contentstack/live-preview-sdk/commit/d9f5eea38a7c2e92f619a2d1e3ebb053073fd6ef))
- added id to tousers list (diwakarmk7 - [e6adff3](https://github.com/contentstack/live-preview-sdk/commit/e6adff37f1e9e81f3053ad62cd0210da5e5926d6))

## [v3.1.3](https://github.com/contentstack/live-preview-sdk/compare/v3.1.2...v3.1.3)

> 4 April 2025

### Fixes

- fix(VE-5643): Replace button is visible for parent wrapper for Multiple file field (Hitesh Shetty - [#410](https://github.com/contentstack/live-preview-sdk/pull/410))
- fix: enhance loading state for form field focus (Hitesh Shetty - [#409](https://github.com/contentstack/live-preview-sdk/pull/409))
- fix(VE-5555): add instance button loading state (Faraaz Biyabani - [#406](https://github.com/contentstack/live-preview-sdk/pull/406))
- fix: call onChangeCallback when live_preview parameter is present in URL (Faraaz Biyabani - [#363](https://github.com/contentstack/live-preview-sdk/pull/363))

### Changes to Test Assests

- test(VE-5478): add unit test for inline editing related functions (Faraaz Biyabani - [#398](https://github.com/contentstack/live-preview-sdk/pull/398))

### General Changes

- v3.1.3 (Sairaj - [#413](https://github.com/contentstack/live-preview-sdk/pull/413))
- Stage-v3.1.3 (Hitesh Shetty - [#412](https://github.com/contentstack/live-preview-sdk/pull/412))
- VE-5544: Investigate button click issue with `data-cslp` attribute (Sairaj - [#408](https://github.com/contentstack/live-preview-sdk/pull/408))

### New Features

- feat(VE-5544): allow click in csr app with modifier key (Sairaj Chouhan - [41dc8ad](https://github.com/contentstack/live-preview-sdk/commit/41dc8adfa4bd7f0bef8f657596a16008cbbb83cc))

### Fixes

- fix: add instance button loading state (Faraaz Biyabani - [11e3862](https://github.com/contentstack/live-preview-sdk/commit/11e3862d59cdeb78423cfda371cf29bce499cb2b))
- fix: call onLiveEdit on registration only in builder (Faraaz Biyabani - [98562c7](https://github.com/contentstack/live-preview-sdk/commit/98562c7370c9b03583d7abb3552af07bc0e9f57f))
- fix(VE-5643): replace button is visible for parent wrapper for multiple file field (Sairaj Chouhan - [2e2c259](https://github.com/contentstack/live-preview-sdk/commit/2e2c259baa42c1b460044c7aa3a091330cb135ec))

### Chores And Housekeeping

- chore: add tagPattern to auto-changelog configuration in package.json (hiteshshetty-dev - [e0a208b](https://github.com/contentstack/live-preview-sdk/commit/e0a208bab316535abfb9c0e1ead19dab95b76f2d))
- chore: update ContentstackLivePreview import to version 3.1.3 in README.md (hiteshshetty-dev - [6b52088](https://github.com/contentstack/live-preview-sdk/commit/6b52088ec4605c5d95358f3bc06002ef136e4f2c))

### Changes to Test Assests

- test: add unit test for inline editing related functions (Faraaz Biyabani - [50a2167](https://github.com/contentstack/live-preview-sdk/commit/50a21675271c7ec65d0959a1e20334011119a729))
- test: fix unit tests related to add instance button (Faraaz Biyabani - [b6af0cc](https://github.com/contentstack/live-preview-sdk/commit/b6af0cc1d6142c9cfcbcdbef745ac245d0f271ca))
- test: add test for replace button visibility in multiple file fields (Sairaj Chouhan - [aa1d818](https://github.com/contentstack/live-preview-sdk/commit/aa1d818533f8759cfc428c6a2c32691041beef93))

### General Changes

- Update src/visualBuilder/utils/handleInlineEditableField.ts (Hitesh Shetty - [3052877](https://github.com/contentstack/live-preview-sdk/commit/30528770bec19e0ca4a5b29b778fb53b1739bd60))

## [v3.1.2](https://github.com/contentstack/live-preview-sdk/compare/v3.1.1...v3.1.2)

> 7 March 2025

### New Features

- feat: v3.1.2 (Faraaz Biyabani - [#381](https://github.com/contentstack/live-preview-sdk/pull/381))
- feat: improve edit button rendering (Faraaz Biyabani - [#371](https://github.com/contentstack/live-preview-sdk/pull/371))
- feat(VE-5170): add plus button configuration (Sairaj - [#349](https://github.com/contentstack/live-preview-sdk/pull/349))
- feat: allow click on elements with studio-ui attribute (Faraaz Biyabani - [#355](https://github.com/contentstack/live-preview-sdk/pull/355))
- feat(VE-4043): add start editing button configuration for builder mode (Sairaj - [#346](https://github.com/contentstack/live-preview-sdk/pull/346))

### Fixes

- fix(VE-5118): add variant revert actions for blocks and groups (srinad007 - [#372](https://github.com/contentstack/live-preview-sdk/pull/372))
- fix(VE-5370): start edit url updates on navigation (Sairaj - [#370](https://github.com/contentstack/live-preview-sdk/pull/370))
- fix: add buttons fix for multiple fields (Sairaj - [#359](https://github.com/contentstack/live-preview-sdk/pull/359))
- fix(VE-5061): add observer to observe cslp of selected element (srinad007 - [#356](https://github.com/contentstack/live-preview-sdk/pull/356))
- fix(VE-5012): add variant classes in case of adding multiple instances (srinad007 - [#351](https://github.com/contentstack/live-preview-sdk/pull/351))
- fix(VE-5080): fix z-index for hover outline and add button (srinad007 - [#341](https://github.com/contentstack/live-preview-sdk/pull/341))

### Chores And Housekeeping

- chore: rename `editButtonBulider` to `editInVisualBuilderButton` (Hitesh Shetty - [#379](https://github.com/contentstack/live-preview-sdk/pull/379))

### Documentation Changes

- docs: add docs for start edit button configuration (Sairaj - [#376](https://github.com/contentstack/live-preview-sdk/pull/376))

### General Changes

- Stage: v3.1.2 (Faraaz Biyabani - [#377](https://github.com/contentstack/live-preview-sdk/pull/377))
- Ve 5139 (srinad007 - [#343](https://github.com/contentstack/live-preview-sdk/pull/343))

### New Features

- feat(VE-5170): customize add button position (Sairaj Chouhan - [4c026eb](https://github.com/contentstack/live-preview-sdk/commit/4c026eb5b6db4aa2a79d1a0e34922619c79fb3f1))
- feat(VE-4043): add basic start editing button configuration (Sairaj Chouhan - [c006c68](https://github.com/contentstack/live-preview-sdk/commit/c006c684a349e958208bdd0ea6e14fb05cbabc7b))
- feat: allow clicks on elements with data-studio-ui attribute set to true (Faraaz Biyabani - [957bae1](https://github.com/contentstack/live-preview-sdk/commit/957bae138622e63dfcdd849746e0327884d07747))

### Fixes

- fix(VE-5061): refactor handleBuilderInteraction (Srinadh Reddy - [bd71fb4](https://github.com/contentstack/live-preview-sdk/commit/bd71fb42970f6320330626b92dbd918cf80ea5d5))
- fix(VE-5139): fix test cases (Srinadh Reddy - [2a29a81](https://github.com/contentstack/live-preview-sdk/commit/2a29a81d187117e9f86b1e2c2348414159c45afb))
- fix(VE-5139): fix event doesnt exist logs in console (Srinadh Reddy - [89ca3d8](https://github.com/contentstack/live-preview-sdk/commit/89ca3d8e4522dd7644769968efdb17b28d4f39b5))
- fix(VE-5118): fix unit test cases (Srinadh Reddy - [9d5b24a](https://github.com/contentstack/live-preview-sdk/commit/9d5b24a6e406bf49c8126a3fae111af7eb17b0ab))

### Chores And Housekeeping

- chore: rename editButtonBulider to editInVisualBuilderButton (Sairaj Chouhan - [bd8be29](https://github.com/contentstack/live-preview-sdk/commit/bd8be29d97c151fc85aad98f55573a6821b3d4fc))
- chore: remove else block (Sairaj Chouhan - [834c3e7](https://github.com/contentstack/live-preview-sdk/commit/834c3e78250f36b32e21c948bda313818f0db7bc))
- chore: update integrity (hiteshshetty-dev - [ad2c8aa](https://github.com/contentstack/live-preview-sdk/commit/ad2c8aa3780b973233a82e5a978254f777773af2))
- chore: remove `describe.only` (Faraaz Biyabani - [5aa5958](https://github.com/contentstack/live-preview-sdk/commit/5aa59587217ff7f64d495240f9e252bcf5b60a9c))

### Changes to Test Assests

- test: isPointerWithinEditButtonSafeZone (Faraaz Biyabani - [3c340e8](https://github.com/contentstack/live-preview-sdk/commit/3c340e8ce52d768f06fbb6b2050ab541a6ac47cb))
- test: add tests for start editing button in builder (Sairaj Chouhan - [f9988a7](https://github.com/contentstack/live-preview-sdk/commit/f9988a74ed9416cc99ce30ed9f3d25314f7eef5c))
- test: fix failing test cases (Sairaj Chouhan - [6d36acb](https://github.com/contentstack/live-preview-sdk/commit/6d36acbd5c4e717f92ce40e2e4490df28a857948))
- test: increase timeout for contenteditable tests (Sairaj Chouhan - [66fee50](https://github.com/contentstack/live-preview-sdk/commit/66fee50387f0a8a9b0ec61b945bec00418dc34f9))

### General Changes

- Update README.md (Hitesh Shetty - [66ef1f1](https://github.com/contentstack/live-preview-sdk/commit/66ef1f1d863d5f252172a427c1851a08372433f8))

## [v3.1.1](https://github.com/contentstack/live-preview-sdk/compare/v3.1.0...v3.1.1)

> 6 February 2025

### Fixes

- fix: remove ^ from preact versions in package json (Hitesh Shetty - [#337](https://github.com/contentstack/live-preview-sdk/pull/337))
- fix(VE-5019): remove ^ from preact versions in package json (Hitesh Shetty - [#336](https://github.com/contentstack/live-preview-sdk/pull/336))

### Refactoring and Updates

- refactor: replace hardcoded class names with constants for empty block parent (Hitesh Shetty - [#331](https://github.com/contentstack/live-preview-sdk/pull/331))

### Changes to Test Assests

- test: add unit tests for error handling and field state validation in visual builder (Hitesh Shetty - [#329](https://github.com/contentstack/live-preview-sdk/pull/329))

### General Changes

- sync main for upcoming release (Hitesh Shetty - [#338](https://github.com/contentstack/live-preview-sdk/pull/338))

### Fixes

- fix: live preview doc (Kirtesh Suthar - [8fcdcc5](https://github.com/contentstack/live-preview-sdk/commit/8fcdcc5127ea722bd9c01f74b1168d9f579e5f30))

### Chores And Housekeeping

- chore: update ContentstackLivePreview version to 3.1.1 in README (hiteshshetty-dev - [d885fa5](https://github.com/contentstack/live-preview-sdk/commit/d885fa5f65ef32e22bfb86fa3871238bdec02d61))

### Changes to Test Assests

- test: remove skipped number field tests and add validation for numeric input (hiteshshetty-dev - [ba0062e](https://github.com/contentstack/live-preview-sdk/commit/ba0062e6c9a5769d124707d6f02e7956a083acb2))
- test: wrap attribute checks in waitFor for visual builder tests (hiteshshetty-dev - [a7a0d53](https://github.com/contentstack/live-preview-sdk/commit/a7a0d5382eab40e84b94699a43a479277808f35c))

### General Changes

- Updated codeowners (Aravind Kumar - [fe41624](https://github.com/contentstack/live-preview-sdk/commit/fe41624a179035f8ed8a2f9ee88c65c958edd29b))
- codeql-analysis.yml (Aravind Kumar - [45c63a2](https://github.com/contentstack/live-preview-sdk/commit/45c63a2e2fbd8fd162520b8e2208fa19e864b3e8))
- sast-scan.yml (Aravind Kumar - [8971dfb](https://github.com/contentstack/live-preview-sdk/commit/8971dfbe798ae4e7d036b86ee30b4b120cf8a6ea))
- jira.yml (Aravind Kumar - [30e4861](https://github.com/contentstack/live-preview-sdk/commit/30e4861e33d5f7c89cffef109e50aa811f6b346a))
- sca-scan.yml (Aravind Kumar - [bcb5ca8](https://github.com/contentstack/live-preview-sdk/commit/bcb5ca8a3a820fab6199166882ae80e8438a074d))

## [v3.1.0](https://github.com/contentstack/live-preview-sdk/compare/v3.0.2...v3.1.0)

> 16 January 2025

### New Features

- feat: allow config object to be exported (Kirtesh Suthar - [#322](https://github.com/contentstack/live-preview-sdk/pull/322))

### Fixes

- fix(VE-4805): back button appears in quickform on clicking canvas (srinad007 - [#320](https://github.com/contentstack/live-preview-sdk/pull/320))
- fix: issue with variant revert dropdown in canvas (srinad007 - [#317](https://github.com/contentstack/live-preview-sdk/pull/317))

### Chores And Housekeeping

- chore: remove snapshot testing (Kirtesh Suthar - [#319](https://github.com/contentstack/live-preview-sdk/pull/319))

### General Changes

- 3.1.0 (Kirtesh Suthar - [#323](https://github.com/contentstack/live-preview-sdk/pull/323))
- Feat/auto changelog (Kirtesh Suthar - [#321](https://github.com/contentstack/live-preview-sdk/pull/321))

### New Features

- feat: add changelog (Kirtesh Suthar - [29ab05a](https://github.com/contentstack/live-preview-sdk/commit/29ab05a654c3c3bb1f69fcc3822c4b937efc1b31))
- feat: add commitlint configuration and update husky pre-commit hook (Kirtesh Suthar - [9aa10a8](https://github.com/contentstack/live-preview-sdk/commit/9aa10a8b9ee9c8ef94f90a2bb1dd70ec748a14cf))

### Fixes

- fix: issue with variant revert dropdown in canvas and show variant icon for multiple fields (Srinadh Reddy - [8718c48](https://github.com/contentstack/live-preview-sdk/commit/8718c4832f30606437da1fd18513006f21e0fd34))
- fix: live preview doc (Kirtesh Suthar - [f81fdf5](https://github.com/contentstack/live-preview-sdk/commit/f81fdf55fd2ab2ce4cac3bf974b0a31566c24001))

### Chores And Housekeeping

- chore: remove debug log from addParamsToUrl function (hiteshshetty-dev - [eedf15b](https://github.com/contentstack/live-preview-sdk/commit/eedf15bc62ba36b51a4e50b62dcc43281b3c5761))

### Refactoring and Updates

- refactor: extract outside click handling to custom hook (Srinadh Reddy - [11c9b8b](https://github.com/contentstack/live-preview-sdk/commit/11c9b8b6a2142def339eb8796273bec6209ebd4e))

### Changes to Test Assests

- test: refactor skipping test modules (hiteshshetty-dev - [28b28be](https://github.com/contentstack/live-preview-sdk/commit/28b28be6171c52d00778a2406c601df9499efd02))
- test: rename related test files; add new tests for getMultilinePlaintext and getDiscussionIdByFieldMetaData (hiteshshetty-dev - [b110ddc](https://github.com/contentstack/live-preview-sdk/commit/b110ddcc448349ad85319361766072ce6fc1795c))
- test: add test cases for variantRevertDropdown component (Srinadh Reddy - [ba5fe41](https://github.com/contentstack/live-preview-sdk/commit/ba5fe410114f42269eaf53bb8721902fd343a7f6))
- test: update mock type casting in visual builder tests (hiteshshetty-dev - [a2d4397](https://github.com/contentstack/live-preview-sdk/commit/a2d4397f53f114e5c7d19e3c0ea2329581e1009f))
- test: enable number field test suite in visual builder input tests (hiteshshetty-dev - [0f59956](https://github.com/contentstack/live-preview-sdk/commit/0f5995635cb1cf29ccdac1ec45b1288b6d494e2d))

## [v3.0.2](https://github.com/contentstack/live-preview-sdk/compare/v3.0.1...v3.0.2)

> 3 January 2025

### Fixes

- fix: remove useSignal (Hitesh Shetty - [#313](https://github.com/contentstack/live-preview-sdk/pull/313))
- fix: pressing space in button contenteditable (Faraaz Biyabani - [#309](https://github.com/contentstack/live-preview-sdk/pull/309))
- fix(VE-4550): add button type to EmptyBlock component for accessibility (Hitesh Shetty - [#312](https://github.com/contentstack/live-preview-sdk/pull/312))
- fix: clean up event listeners in FieldToolbar and update query selector (Hitesh Shetty - [#311](https://github.com/contentstack/live-preview-sdk/pull/311))
- fix(VE-4530): exclude properties doesn't check for frame status on `outsideLivePreviewPortal` (Hitesh Shetty - [#310](https://github.com/contentstack/live-preview-sdk/pull/310))
- fix: add video tag in the void elements list (Kirtesh Suthar - [#307](https://github.com/contentstack/live-preview-sdk/pull/307))
- fix: error when selecting a non text HTML element with the cslp of a text field (Faraaz Biyabani - [#299](https://github.com/contentstack/live-preview-sdk/pull/299))

### General Changes

- v3.0.2 (Hitesh Shetty - [#315](https://github.com/contentstack/live-preview-sdk/pull/315))
- Update license copyright year(s) (Faraaz Biyabani - [#316](https://github.com/contentstack/live-preview-sdk/pull/316))
- Updated logic for inline editing encompassing CT changes (Ayush Dubey - [#306](https://github.com/contentstack/live-preview-sdk/pull/306))
- handle multiple variant status case (srinad007 - [#302](https://github.com/contentstack/live-preview-sdk/pull/302))
- Revert "Updated logic for inline editing considering CT changes" (Ayush Dubey - [#305](https://github.com/contentstack/live-preview-sdk/pull/305))
- Updated logic for inline editing considering CT changes (Ayush Dubey - [#304](https://github.com/contentstack/live-preview-sdk/pull/304))

### Fixes

- fix: remove mousedown handler for button contenteditable (Faraaz Biyabani - [1de44d5](https://github.com/contentstack/live-preview-sdk/commit/1de44d512a9ac2aeb6f83dd5f613a5e7802374d8))
- fix: error when selecting a non text HTML element with the cslp of a text field (Faraaz Biyabani - [fd0b8d5](https://github.com/contentstack/live-preview-sdk/commit/fd0b8d572e37c8eb54d002cb76a6d4b707e9f7e2))
- fix: pseudo editable element for multiple text fields (Sairaj Chouhan - [56947cc](https://github.com/contentstack/live-preview-sdk/commit/56947cc333f2292191b2371bc3b96433b9ea5cab))

### Chores And Housekeeping

- chore: remove duplicate test for edit button rendering (hiteshshetty-dev - [d5f313c](https://github.com/contentstack/live-preview-sdk/commit/d5f313c6012ba7e88cccf63d80674e8b1825b17f))
- chore: improve condition for multiple parent check (Sairaj Chouhan - [119294b](https://github.com/contentstack/live-preview-sdk/commit/119294bc06a47be90084c4081548158a4ee396de))
- chore: increase timeout (Sairaj Chouhan - [862b350](https://github.com/contentstack/live-preview-sdk/commit/862b35067f22118fd4a5ed0b9798f0a8a07c7933))

### Documentation Changes

- docs(license): update copyright year(s) (github-actions - [8715d90](https://github.com/contentstack/live-preview-sdk/commit/8715d902c18c4edd8ef426f408f85304ca9d2d58))

### Changes to Test Assests

- test: space character in button contenteditable (Faraaz Biyabani - [b88783e](https://github.com/contentstack/live-preview-sdk/commit/b88783e8abf53f3e294ca12b0d0fd3c57ea86135))

### General Changes

- Merge pull request #308 from contentstack/VE-4326 (Sairaj - [1b5cde7](https://github.com/contentstack/live-preview-sdk/commit/1b5cde7de17ebf6d9c26facb3f155ce7d4baae0f))
- Merge pull request #301 from contentstack/VE-4009-pseudo-multiple (Sairaj - [e8c6080](https://github.com/contentstack/live-preview-sdk/commit/e8c608078df7256d1634175f81c9928612b0d9b8))

## [v3.0.1](https://github.com/contentstack/live-preview-sdk/compare/v3.0.0...v3.0.1)

> 15 November 2024

### New Features

- feat: v3.0.1 (srinad007 - [#296](https://github.com/contentstack/live-preview-sdk/pull/296))

### Fixes

- fix: psuedo editable re-positioning logic (Faraaz Biyabani - [#294](https://github.com/contentstack/live-preview-sdk/pull/294))

### General Changes

- remove focus event if selected element is not in dom (srinad007 - [#298](https://github.com/contentstack/live-preview-sdk/pull/298))
- remove position relative on element (srinad007 - [#297](https://github.com/contentstack/live-preview-sdk/pull/297))
- fix remove highlight variant field classes (srinad007 - [#291](https://github.com/contentstack/live-preview-sdk/pull/291))

### Fixes

- fix: psuedo-editable element re-positioning logic (Faraaz Biyabani - [c6c354b](https://github.com/contentstack/live-preview-sdk/commit/c6c354bb74515a52cbe77d0c2bd9f03f057ef2dd))

### Chores And Housekeeping

- chore: update version (Faraaz Biyabani - [7a5edf5](https://github.com/contentstack/live-preview-sdk/commit/7a5edf52fb6b04f3ee1d0464d6016550a0c84693))
- chore: hide overlay on delete event (Sairaj Chouhan - [7a9a14e](https://github.com/contentstack/live-preview-sdk/commit/7a9a14ef91cb79b96e8b90b25c3e1f45a817edb2))

### General Changes

- Merge pull request #295 from contentstack/VE-3974-focus-loses-when-a-field-is-deleted (Sairaj - [ebc671b](https://github.com/contentstack/live-preview-sdk/commit/ebc671b51a9b6c67f33e380eee47214f76bde5a0))

## [v3.0.0](https://github.com/contentstack/live-preview-sdk/compare/v2.0.4...v3.0.0)

> 5 November 2024

### New Features

- feat: hide edit tags when website is in timeline preview (Kirtesh Suthar - [#285](https://github.com/contentstack/live-preview-sdk/pull/285))
- feat: add support to live sync form on inline editing (Hitesh Shetty - [#279](https://github.com/contentstack/live-preview-sdk/pull/279))
- feat: created seperate class for permenant tooltip (Venkatesh B - [#263](https://github.com/contentstack/live-preview-sdk/pull/263))
- feat: UI Text and Error message changes (Venkatesh B - [#262](https://github.com/contentstack/live-preview-sdk/pull/262))
- feat: include href in init call (Hitesh Shetty - [#255](https://github.com/contentstack/live-preview-sdk/pull/255))
- feat: discussionId to discussion payload changes(Imapct of resolve API) (Venkatesh B - [#248](https://github.com/contentstack/live-preview-sdk/pull/248))
- feat: add mouse click event handling and post message support (Hitesh Shetty - [#253](https://github.com/contentstack/live-preview-sdk/pull/253))
- feat: Handle Comment modal should open on click event in highlighed … (Hitesh Shetty - [#242](https://github.com/contentstack/live-preview-sdk/pull/242))
- feat: update comment highlighting to append icons within visual build… (Hitesh Shetty - [#232](https://github.com/contentstack/live-preview-sdk/pull/232))
- feat: add support for base field editing (Hitesh Shetty - [#231](https://github.com/contentstack/live-preview-sdk/pull/231))
- feat: Highlight active discussion (Venkatesh B - [#230](https://github.com/contentstack/live-preview-sdk/pull/230))
- feat: add Inter font for visual builder (Hitesh Shetty - [#221](https://github.com/contentstack/live-preview-sdk/pull/221))
- feat: hover state styling for more buttons (Faraaz Biyabani - [#191](https://github.com/contentstack/live-preview-sdk/pull/191))
- feat: expand add buttons of a block on hover (Faraaz Biyabani - [#190](https://github.com/contentstack/live-preview-sdk/pull/190))
- feat: enhanced field label in focused toolbar (Hitesh Shetty - [#181](https://github.com/contentstack/live-preview-sdk/pull/181))
- feat: focus on added instance or block (Faraaz Biyabani - [#177](https://github.com/contentstack/live-preview-sdk/pull/177))
- feat: hide focus overlay on add instance button click (Hitesh Shetty - [#171](https://github.com/contentstack/live-preview-sdk/pull/171))
- feat: update focussed state and misc. improvements (Faraaz Biyabani - [#167](https://github.com/contentstack/live-preview-sdk/pull/167))
- feat: replace reference (Faraaz Biyabani - [#166](https://github.com/contentstack/live-preview-sdk/pull/166))
- feat: disabled state for hover outline and field focus outline (Faraaz Biyabani - [#158](https://github.com/contentstack/live-preview-sdk/pull/158))
- feat: toolbar edit icons for modal editable fields (Faraaz Biyabani - [#156](https://github.com/contentstack/live-preview-sdk/pull/156))
- feat: field edit modal for JSON RTE and link fields (Faraaz Biyabani - [#150](https://github.com/contentstack/live-preview-sdk/pull/150))
- feat: hide/show custom cursor on canvas mouseleave/mouseenter (Hitesh Shetty - [#146](https://github.com/contentstack/live-preview-sdk/pull/146))
- feat: Refactor getLiveEditorRedirectionUrl to use URLSearchParams (Hitesh Shetty - [#144](https://github.com/contentstack/live-preview-sdk/pull/144))
- feat: handling date fields (Faraaz Biyabani - [#140](https://github.com/contentstack/live-preview-sdk/pull/140))
- feat: handling number fields (Faraaz Biyabani - [#139](https://github.com/contentstack/live-preview-sdk/pull/139))
- feat: add support to disabled editing in Canvas (Hitesh Shetty - [#99](https://github.com/contentstack/live-preview-sdk/pull/99))
- feat: isSSR boolean value in liveEditorPostMessage.send event's payload (sayan-contentstack - [#98](https://github.com/contentstack/live-preview-sdk/pull/98))
- feat: support test ellipsis in edit field (Deepak Kharah - [#97](https://github.com/contentstack/live-preview-sdk/pull/97))
- feat: set live preview details from the URL (Deepak Kharah - [#95](https://github.com/contentstack/live-preview-sdk/pull/95))
- feat: conditionally add edit button (Deepak Kharah - [#90](https://github.com/contentstack/live-preview-sdk/pull/90))
- feat: live editor url contains the target url in search param (Deepak Kharah - [#87](https://github.com/contentstack/live-preview-sdk/pull/87))
- feat: move btn to right and add focus event (Deepak Kharah - [#84](https://github.com/contentstack/live-preview-sdk/pull/84))
- feat: Retrieve field metadata from the parent (Deepak Kharah - [#83](https://github.com/contentstack/live-preview-sdk/pull/83))
- feat: update outline styles (Deepak Kharah - [#80](https://github.com/contentstack/live-preview-sdk/pull/80))
- feat: escape key closes the overlay (Deepak Kharah - [#77](https://github.com/contentstack/live-preview-sdk/pull/77))
- feat: add config handler (Deepak Kharah - [#75](https://github.com/contentstack/live-preview-sdk/pull/75))
- feat: hide start editing button inside editor (Deepak Kharah - [#74](https://github.com/contentstack/live-preview-sdk/pull/74))
- feat: convert button to anchor tag (Deepak Kharah - [#73](https://github.com/contentstack/live-preview-sdk/pull/73))
- feat: retrieve content type from the editor (Deepak Kharah - [#71](https://github.com/contentstack/live-preview-sdk/pull/71))
- feat: add locale support for visual editor (Deepak Kharah - [#70](https://github.com/contentstack/live-preview-sdk/pull/70))
- feat: handle individual fields (Deepak Kharah - [#69](https://github.com/contentstack/live-preview-sdk/pull/69))
- feat: separate input event (Deepak Kharah - [#63](https://github.com/contentstack/live-preview-sdk/pull/63))
- feat: handle visual editor number fields (Deepak Kharah - [#62](https://github.com/contentstack/live-preview-sdk/pull/62))
- feat: add multiple buttons and add test cases (Deepak Kharah - [#60](https://github.com/contentstack/live-preview-sdk/pull/60))
- feat: add proper support for getFieldTypes (Deepak Kharah - [#59](https://github.com/contentstack/live-preview-sdk/pull/59))
- feat: handle add buttons during multiple (Deepak Kharah - [#58](https://github.com/contentstack/live-preview-sdk/pull/58))
- feat: add content type schema interface (Deepak Kharah - [#57](https://github.com/contentstack/live-preview-sdk/pull/57))
- feat: handle stack details for editor mode (Deepak Kharah - [#54](https://github.com/contentstack/live-preview-sdk/pull/54))
- feat: SDK redirects to client url params. (Deepak Kharah - [#53](https://github.com/contentstack/live-preview-sdk/pull/53))

### Fixes

- fix: publishing issues (Deepak Kharah - [#293](https://github.com/contentstack/live-preview-sdk/pull/293))
- fix: escape regexp (Hitesh Shetty - [#276](https://github.com/contentstack/live-preview-sdk/pull/276))
- fix: disable add instance button when max. instances have been added (Faraaz Biyabani - [#254](https://github.com/contentstack/live-preview-sdk/pull/254))
- fix: github issue: add URL only when init-ack received (Mridul Sharma - [#247](https://github.com/contentstack/live-preview-sdk/pull/247))
- fix: adding curser pointer to the component (Venkatesh B - [#245](https://github.com/contentstack/live-preview-sdk/pull/245))
- fix: handle cursor collapse on empty element (Faraaz Biyabani - [#241](https://github.com/contentstack/live-preview-sdk/pull/241))
- fix: bug fixing on taxanomy and link field multiple (Venkatesh B - [#223](https://github.com/contentstack/live-preview-sdk/pull/223))
- fix:hide comment icon when not needed (Hitesh Shetty - [#222](https://github.com/contentstack/live-preview-sdk/pull/222))
- fix: hide contenteditable outline (Faraaz Biyabani - [#220](https://github.com/contentstack/live-preview-sdk/pull/220))
- fix: visual builder icon class name changes (Venkatesh B - [#215](https://github.com/contentstack/live-preview-sdk/pull/215))
- fix: incorrect focus on blocks field instead of new block (Hitesh Shetty - [#197](https://github.com/contentstack/live-preview-sdk/pull/197))
- fix: heading infinite loader and window error in server (Hitesh Shetty - [#193](https://github.com/contentstack/live-preview-sdk/pull/193))
- fix: link navigation (Faraaz Biyabani - [#184](https://github.com/contentstack/live-preview-sdk/pull/184))
- fix: multiple instance added at incorrect index (Faraaz Biyabani - [#172](https://github.com/contentstack/live-preview-sdk/pull/172))
- Fix: Field toolbar append issue (Ayush Dubey - [#168](https://github.com/contentstack/live-preview-sdk/pull/168))
- fix: display names loading state (Faraaz Biyabani - [#163](https://github.com/contentstack/live-preview-sdk/pull/163))
- fix: single line line break and unnecessary psuedo editable due to nbsp (Faraaz Biyabani - [#160](https://github.com/contentstack/live-preview-sdk/pull/160))
- fix: duplicate field path items (Faraaz Biyabani - [#157](https://github.com/contentstack/live-preview-sdk/pull/157))
- fix: types in test file (Hitesh Shetty - [#151](https://github.com/contentstack/live-preview-sdk/pull/151))
- fix: add windowType in the editor's init. (Deepak Kharah - [#92](https://github.com/contentstack/live-preview-sdk/pull/92))
- fix: update field adds `&lt;div/&gt;` element (Deepak Kharah - [#91](https://github.com/contentstack/live-preview-sdk/pull/91))
- fix: add instance returned incorrect index (Deepak Kharah - [#86](https://github.com/contentstack/live-preview-sdk/pull/86))
- fix: redirect page to /live-editor (Deepak Kharah - [#72](https://github.com/contentstack/live-preview-sdk/pull/72))

### Chores And Housekeeping

- chore: update readme (Deepak Kharah - [#292](https://github.com/contentstack/live-preview-sdk/pull/292))
- chore: remove recheck package and simplify the code (Hitesh Shetty - [#280](https://github.com/contentstack/live-preview-sdk/pull/280))
- chore:implement disabled fields in audience mode (srinad007 - [#218](https://github.com/contentstack/live-preview-sdk/pull/218))
- chore: remove the unused packages (Deepak Kharah - [#219](https://github.com/contentstack/live-preview-sdk/pull/219))
- chore: bump version for version compatibility with UI-React LP 2.0 (Hitesh Shetty - [#148](https://github.com/contentstack/live-preview-sdk/pull/148))
- chore: add event to get all entries in a page (Sairaj - [#96](https://github.com/contentstack/live-preview-sdk/pull/96))
- chore: snyc changes from main (Deepak Kharah - [#88](https://github.com/contentstack/live-preview-sdk/pull/88))
- chore: update @contentstack/advanced-post-message version (Deepak Kharah - [#79](https://github.com/contentstack/live-preview-sdk/pull/79))

### Changes to Test Assests

- test: fix and reorganize unit tests (Hitesh Shetty - [#258](https://github.com/contentstack/live-preview-sdk/pull/258))
- test: fix cases of sdk modularization (Deepak Kharah - [#105](https://github.com/contentstack/live-preview-sdk/pull/105))
- test: handle overlay DOM for inline editing (Deepak Kharah - [#61](https://github.com/contentstack/live-preview-sdk/pull/61))
- test: add cases for basic implementation (Deepak Kharah - [#55](https://github.com/contentstack/live-preview-sdk/pull/55))

### General Changes

- Vc 115/live editor support (Deepak Kharah - [#246](https://github.com/contentstack/live-preview-sdk/pull/246))
- Ve 3862 unit testing for Comment Icon and related code (Venkatesh B - [#282](https://github.com/contentstack/live-preview-sdk/pull/282))
- Ve 3823 Tooltip Position Invert when space isn't available (Hitesh Shetty - [#289](https://github.com/contentstack/live-preview-sdk/pull/289))
- Handle remove focus event (srinad007 - [#290](https://github.com/contentstack/live-preview-sdk/pull/290))
- reevaluate variant classes when reloading iframe (srinad007 - [#287](https://github.com/contentstack/live-preview-sdk/pull/287))
- VE-3888 Keep Z Index of toolbar & its child elements at highest possible value (Amey Shrivastava - [#281](https://github.com/contentstack/live-preview-sdk/pull/281))
- Ve 3818 variant icon in toolbar (Hitesh Shetty - [#277](https://github.com/contentstack/live-preview-sdk/pull/277))
- Field focus wrapper and toolbar design update (Hitesh Shetty - [#275](https://github.com/contentstack/live-preview-sdk/pull/275))
- Sync/main change 2.0.4 (Hitesh Shetty - [#274](https://github.com/contentstack/live-preview-sdk/pull/274))
- Ve 3709 (Hitesh Shetty - [#273](https://github.com/contentstack/live-preview-sdk/pull/273))
- store variant and cms locale in global state (srinad007 - [#272](https://github.com/contentstack/live-preview-sdk/pull/272))
- card button resizing issue fixed (jothi-contentstack - [#265](https://github.com/contentstack/live-preview-sdk/pull/265))
- VE-3355 send additional data for field revert (Hitesh Shetty - [#269](https://github.com/contentstack/live-preview-sdk/pull/269))
- Shift focus when editableElement position/size changes due to external change (Ayush Dubey - [#266](https://github.com/contentstack/live-preview-sdk/pull/266))
- After Patch Update Variant Classes | Recalculate Variant Data CSLP Values (Amey Shrivastava - [#264](https://github.com/contentstack/live-preview-sdk/pull/264))
- VE-3573: Fix Custom Cursor Issues (Flicker & Additional Space) | IFrame Body Height Mismatch due to residual overlay (Amey Shrivastava - [#268](https://github.com/contentstack/live-preview-sdk/pull/268))
- Add: Try catch to getFieldVariantStatus (Hitesh Shetty - [#261](https://github.com/contentstack/live-preview-sdk/pull/261))
- Added `mode` in init event post message (Ayush Dubey - [#259](https://github.com/contentstack/live-preview-sdk/pull/259))
- implement highlight variant fields in audience when checked (srinad007 - [#257](https://github.com/contentstack/live-preview-sdk/pull/257))
- Ve 3355 iframe variant revert (Hitesh Shetty - [#252](https://github.com/contentstack/live-preview-sdk/pull/252))
- Exported VB_EmptyBlockParentClass (Ayush Dubey - [#251](https://github.com/contentstack/live-preview-sdk/pull/251))
- Typescript Delivery SDK support (Ayush Dubey - [#244](https://github.com/contentstack/live-preview-sdk/pull/244))
- Custom mouse pointer z-index fix (Ayush Dubey - [#239](https://github.com/contentstack/live-preview-sdk/pull/239))
- Ve 3038 add support to highlight comments in canvas on discussion tab open (Venkatesh B - [#237](https://github.com/contentstack/live-preview-sdk/pull/237))
- multiple toolbar fix (Ayush Dubey - [#236](https://github.com/contentstack/live-preview-sdk/pull/236))
- VE-3200-migrate-sdk-from-editor-to-builder (Deepak Kharah - [#226](https://github.com/contentstack/live-preview-sdk/pull/226))
- VE-3197-update-test-setup (Deepak Kharah - [#225](https://github.com/contentstack/live-preview-sdk/pull/225))
- Changes to support tsup/esbuild + preact (Ayush Dubey - [#224](https://github.com/contentstack/live-preview-sdk/pull/224))
- Ve 72 render comment icon in the focus editing view (Venkatesh B - [#216](https://github.com/contentstack/live-preview-sdk/pull/216))
- Ve 72 render comment icon in the focus editing view (Venkatesh B - [#214](https://github.com/contentstack/live-preview-sdk/pull/214))
- Ve 2866 (srinad007 - [#208](https://github.com/contentstack/live-preview-sdk/pull/208))
- VE-2647-merge-v2-v3 (Deepak Kharah - [#207](https://github.com/contentstack/live-preview-sdk/pull/207))
- Multiline Field Support (Ayush Dubey - [#204](https://github.com/contentstack/live-preview-sdk/pull/204))
- Taxonomy Icon on custom cursor (Ayush Dubey - [#203](https://github.com/contentstack/live-preview-sdk/pull/203))
- Multiple Reference Instances' toolbar buttons (Ayush Dubey - [#202](https://github.com/contentstack/live-preview-sdk/pull/202))
- Canvas URL field editing and mouse event blocking (Ayush Dubey - [#199](https://github.com/contentstack/live-preview-sdk/pull/199))
- Toolbar Dropdown buttons hover styles and contenteditable border remove (Ayush Dubey - [#194](https://github.com/contentstack/live-preview-sdk/pull/194))
- VE-2354 Fix: Overflow & Cutoff on Right Edge (Amey Shrivastava - [#192](https://github.com/contentstack/live-preview-sdk/pull/192))
- Consistent Toolbar Position (Amey Shrivastava - [#189](https://github.com/contentstack/live-preview-sdk/pull/189))
- MouseHover fix (Ayush Dubey - [#188](https://github.com/contentstack/live-preview-sdk/pull/188))
- Fix: Hover on editable element (Ayush Dubey - [#187](https://github.com/contentstack/live-preview-sdk/pull/187))
- Adjust toolbar position to prevent overlap when space is limited (Amey Shrivastava - [#185](https://github.com/contentstack/live-preview-sdk/pull/185))
- highlight draft fields (srinad007 - [#183](https://github.com/contentstack/live-preview-sdk/pull/183))
- VE-2376 Handle changes in element positions due to sidebar toggling or window resizing (Amey Shrivastava - [#182](https://github.com/contentstack/live-preview-sdk/pull/182))
- Revert "Editable components cursor visibility style changes" (Hitesh Shetty - [#180](https://github.com/contentstack/live-preview-sdk/pull/180))
- Revert "Overlay style and calculation changes" (Hitesh Shetty - [#179](https://github.com/contentstack/live-preview-sdk/pull/179))
- Overlay style and calculation changes (Ayush Dubey - [#178](https://github.com/contentstack/live-preview-sdk/pull/178))
- Multiline Text field enhancements (Ayush Dubey - [#176](https://github.com/contentstack/live-preview-sdk/pull/176))
- Disable navigation arrows based on position (Amey Shrivastava - [#174](https://github.com/contentstack/live-preview-sdk/pull/174))
- Hide the caret if there are no parent paths (Amey Shrivastava - [#175](https://github.com/contentstack/live-preview-sdk/pull/175))
- Editable components cursor visibility style changes (Ayush Dubey - [#173](https://github.com/contentstack/live-preview-sdk/pull/173))
- Overlay calculation fix for hover leakage (Ayush Dubey - [#155](https://github.com/contentstack/live-preview-sdk/pull/155))
- Fix outline clickability (Ayush Dubey - [#153](https://github.com/contentstack/live-preview-sdk/pull/153))
- Import fix for test file (Faraaz Biyabani - [#152](https://github.com/contentstack/live-preview-sdk/pull/152))
- Overlay changes to stop anchor tag navigation (Ayush Dubey - [#149](https://github.com/contentstack/live-preview-sdk/pull/149))
- Revert "feat: handling date fields" (Faraaz Biyabani - [#143](https://github.com/contentstack/live-preview-sdk/pull/143))
- Fix the bug that caused wrong fieldWrapper parent tags above blocks of a modularblock field (sayan-contentstack - [#138](https://github.com/contentstack/live-preview-sdk/pull/138))
- Added event to retrieve all entries in a page (Ayush Dubey - [#133](https://github.com/contentstack/live-preview-sdk/pull/133))
- Cursor behaviour change on hover and click (Ayush Dubey - [#131](https://github.com/contentstack/live-preview-sdk/pull/131))
- Replace asset button ui update (sayan-contentstack - [#129](https://github.com/contentstack/live-preview-sdk/pull/129))
- Fix for website shaking due to overlay (Ayush Dubey - [#125](https://github.com/contentstack/live-preview-sdk/pull/125))
- Plus button to only appear on mouse click (Ayush Dubey - [#124](https://github.com/contentstack/live-preview-sdk/pull/124))
- Added outline to hovered elements (Ayush Dubey - [#123](https://github.com/contentstack/live-preview-sdk/pull/123))
- Introduced `EmptyBlocks` for handling empty block entries (Ayush Dubey - [#122](https://github.com/contentstack/live-preview-sdk/pull/122))
- Introduced Instance's `fieldPathWithIndex` in post-message payloads (Ayush Dubey - [#119](https://github.com/contentstack/live-preview-sdk/pull/119))
- EB-1566: Few fields like links groups etc are not highlighted properly (Vishvam S - [#118](https://github.com/contentstack/live-preview-sdk/pull/118))
- EB-1565: Sidebar sometimes load and sometimes doesn't (Vishvam S - [#117](https://github.com/contentstack/live-preview-sdk/pull/117))
- EB-1045: Unit test case for sdk fix existing test cases (Vishvam S - [#114](https://github.com/contentstack/live-preview-sdk/pull/114))
- EB-1201: Edit button is showing in live editor window (Vishvam S - [#112](https://github.com/contentstack/live-preview-sdk/pull/112))
- EB-1200: Implement signals in live preview sdk (Vishvam S - [#111](https://github.com/contentstack/live-preview-sdk/pull/111))
- EB-1047 : Unit test case for new framework (Vishvam S - [#108](https://github.com/contentstack/live-preview-sdk/pull/108))
- Add Preact Support (Vishvam S - [#107](https://github.com/contentstack/live-preview-sdk/pull/107))
- Eb 1043 modularize the sdk (Deepak Kharah - [#104](https://github.com/contentstack/live-preview-sdk/pull/104))
- Add support for Focused State (Ravi Lamkoti - [#94](https://github.com/contentstack/live-preview-sdk/pull/94))
- Add support for custom cursor icon (Hitesh Shetty - [#93](https://github.com/contentstack/live-preview-sdk/pull/93))
- Eb 766 resize focus area onchange (Jayesh Deorukhkar - [#82](https://github.com/contentstack/live-preview-sdk/pull/82))

### New Features

- feat: Added unit testing for comment icon (Venkat - [9da12c6](https://github.com/contentstack/live-preview-sdk/commit/9da12c602445b75e85f34e70ec956df3f1ab3a61))
- feat: increase z-index for Builder DOM elements (hiteshshetty-dev - [7aed918](https://github.com/contentstack/live-preview-sdk/commit/7aed918c850ac627a6cfe3581dc0299c98eb847c))
- feat: rename OPEN_QUICK_FORM to TOGGLE_FORM in post message events (hiteshshetty-dev - [9da8bdf](https://github.com/contentstack/live-preview-sdk/commit/9da8bdfd8caaa46728540965aeaae3f43216f765))
- feat: increase z-index for Field Label dropdown items (hiteshshetty-dev - [b5a95d3](https://github.com/contentstack/live-preview-sdk/commit/b5a95d3033ea5dc1894e51fc6d765d3cdc7d789d))
- feat: code cleaning (Venkat - [a018d0f](https://github.com/contentstack/live-preview-sdk/commit/a018d0f4c79c52ac84dba09844bc9412c14bfd59))
- feat: render commment icon and integrate with visual-builder modal (Venkat - [a3b2262](https://github.com/contentstack/live-preview-sdk/commit/a3b2262ffe4675faaa01da7d4ae34bada3084524))
- feat: Handle Comment modal should open on click event in highlighed icon (Venkat - [959e6b7](https://github.com/contentstack/live-preview-sdk/commit/959e6b7ff322b3e28639bdcc787d68e870423acd))
- feat: update comment icon for Highlight (hiteshshetty-dev - [246853d](https://github.com/contentstack/live-preview-sdk/commit/246853d04fc9f68cf40e5464b373d32bc647b106))
- feat: fix psuedo editable element positioning (hiteshshetty-dev - [06449bd](https://github.com/contentstack/live-preview-sdk/commit/06449bdc2cafed991585eb7c9da470cf82262369))
- feat: handle scroll to field (Venkat - [763ae74](https://github.com/contentstack/live-preview-sdk/commit/763ae747bc2b7b2a493e1757bb5ea679691657a2))
- feat: update comment highlighting to append icons within visual builder container (hiteshshetty-dev - [a9fd211](https://github.com/contentstack/live-preview-sdk/commit/a9fd211fa08123e3e350b71de4238933d37fc760))
- feat: add Inter font (Faraaz Biyabani - [59f442b](https://github.com/contentstack/live-preview-sdk/commit/59f442b9acfceb2ec7a140b2cb85d9a5e7c8fd68))
- feat: live editor prototype (Deepak Kharah - [163e847](https://github.com/contentstack/live-preview-sdk/commit/163e8477276ea0ce315d3d3371b543f18f0cb766))
- feat: handle date field (Faraaz Biyabani - [c20bab5](https://github.com/contentstack/live-preview-sdk/commit/c20bab57431dec4b6216c8e985ce94a84a74d7aa))
- feat: get content types from the editor (Deepak Kharah - [6572502](https://github.com/contentstack/live-preview-sdk/commit/6572502be574678a73e3ca6078cf82de0e1fe54d))
- feat: number field tests and esc to unfocus fields (Faraaz Biyabani - [44fe96d](https://github.com/contentstack/live-preview-sdk/commit/44fe96d006b7f324b5bbf869ac6a043402d0ac00))
- feat: add icons for all modal editable fields (Faraaz Biyabani - [cd52e03](https://github.com/contentstack/live-preview-sdk/commit/cd52e03bc38bc0c35c187875809f50e18c2f1705))
- feat: remove manual dom replacement for SSR (Deepak Kharah - [c0c1e6e](https://github.com/contentstack/live-preview-sdk/commit/c0c1e6ed0b76b1222b2bef006bf6e7a2f9f2d86f))
- feat: update focussed state in resize observer (Faraaz Biyabani - [af2c05f](https://github.com/contentstack/live-preview-sdk/commit/af2c05f418e46097b43c5010db9b8a53b8bd6e25))
- feat: move postmessage to eventManager (Deepak Kharah - [c41fef8](https://github.com/contentstack/live-preview-sdk/commit/c41fef835214b2e3a561e93829dba2cb3a346042))
- feat: update getFieldType (Deepak Kharah - [7ff3f06](https://github.com/contentstack/live-preview-sdk/commit/7ff3f067b20a28e6a44077b3716464eedd61a5f4))
- feat: add support for disabled state in canvas (hiteshshetty-dev - [061d1d3](https://github.com/contentstack/live-preview-sdk/commit/061d1d3471c6493be346f47cae0feb9de911b2a6))
- feat: field edit modal (Faraaz Biyabani - [fd37415](https://github.com/contentstack/live-preview-sdk/commit/fd3741551f44a1e2a75873efccf23f9bb1b3811e))
- feat: deprecate passing only stack sdk (Deepak Kharah - [4eaeecd](https://github.com/contentstack/live-preview-sdk/commit/4eaeecd23bcb7e68fe11d7bf6e01a82cf8a9002b))
- feat: add custom cursor support (hiteshshetty-dev - [7e9de74](https://github.com/contentstack/live-preview-sdk/commit/7e9de74ce0e7804b5172fa340c6e98c90f38b10b))
- feat: use config handler (Deepak Kharah - [f7b703b](https://github.com/contentstack/live-preview-sdk/commit/f7b703b467aa80bb7e3f59dab0365ab5464281df))
- feat: add parent data in cslp (Deepak Kharah - [cd0f91e](https://github.com/contentstack/live-preview-sdk/commit/cd0f91e0db945bc135a1ceb19909f33bc344efe2))
- feat: add icons for json rte, link (Faraaz Biyabani - [57c962b](https://github.com/contentstack/live-preview-sdk/commit/57c962bcd35b250a8d352170043a74f0c1d692a0))
- feat: add replace asset button (Deepak Kharah - [6322c9b](https://github.com/contentstack/live-preview-sdk/commit/6322c9b91192a09adf2c4bd3924f32e3eac4fdec))
- feat: move start editing button to new folder (Deepak Kharah - [10efafa](https://github.com/contentstack/live-preview-sdk/commit/10efafa3ea4baae108bac0c20d5fa2af118dae7b))
- feat: disabled hover and field focus states (wip) (Faraaz Biyabani - [41d2305](https://github.com/contentstack/live-preview-sdk/commit/41d2305edfb650f84ac3f44d234a37ba8b755f94))
- feat: Add mode support (Deepak Kharah - [941d7bd](https://github.com/contentstack/live-preview-sdk/commit/941d7bdec6cf9ea715906e36bb4d8e20d478da37))
- feat: updating the focus when dom is resized (Jayesh Deorukhkar - [2b71e35](https://github.com/contentstack/live-preview-sdk/commit/2b71e35020e8049710079385db1174470a313fd2))
- feat: add adv post message (Deepak Kharah - [fdac751](https://github.com/contentstack/live-preview-sdk/commit/fdac7510e8ba580025f627fc1dd5dc1afa684748))
- feat: focus newly added instances (Faraaz Biyabani - [1856d87](https://github.com/contentstack/live-preview-sdk/commit/1856d876112052be1a501d040400b95c5b046145))
- feat: update type for getFieldType (Deepak Kharah - [9d268f8](https://github.com/contentstack/live-preview-sdk/commit/9d268f82d02bebaa20ad2629ca46031d418ec808))
- feat: handle stack detail in editor mode (Deepak Kharah - [6b763e4](https://github.com/contentstack/live-preview-sdk/commit/6b763e43607c1e3d386237c4801a9404aae52905))
- feat: add support for custom field (Deepak Kharah - [75f9ca7](https://github.com/contentstack/live-preview-sdk/commit/75f9ca721ceccc6240aaee0e189bc3d611df3be6))
- feat: cleanup on cancel, field specific container div (Faraaz Biyabani - [3fb21ab](https://github.com/contentstack/live-preview-sdk/commit/3fb21ab81f254b3dd8ac18f9ceb3a94decb72a50))
- feat: disconnect mutation observer after timeout (Faraaz Biyabani - [7ff5f30](https://github.com/contentstack/live-preview-sdk/commit/7ff5f30d164a0e8ef349dd53c66f99a138c3d210))
- feat: disabled hover and field focus states (Faraaz Biyabani - [7e29dda](https://github.com/contentstack/live-preview-sdk/commit/7e29dda5b0c181d7c06ba0b8b65a8a9333c7e9c4))
- feat: add separate live preview module in editor (Deepak Kharah - [c4273b0](https://github.com/contentstack/live-preview-sdk/commit/c4273b09e3c3d5c4afbb32c97101bfa84aa73968))
- feat: make debug flag official (Deepak Kharah - [95fddd0](https://github.com/contentstack/live-preview-sdk/commit/95fddd0dd0f785913bb484a5153781e1d57b970e))
- feat: disable default cursor in visual editor (hiteshshetty-dev - [4bb7686](https://github.com/contentstack/live-preview-sdk/commit/4bb7686ac4fe8b7e1041228f660630d9e24959f4))
- feat: add branch support (Deepak Kharah - [8de07f4](https://github.com/contentstack/live-preview-sdk/commit/8de07f4c656965de68907c712d00302538e21e04))
- feat: add testid to start editing button (Deepak Kharah - [1db1fba](https://github.com/contentstack/live-preview-sdk/commit/1db1fbab4d6fc948548b1119fee161d75b4dbc23))
- feat: update app port to 3030 (Deepak Kharah - [b927fba](https://github.com/contentstack/live-preview-sdk/commit/b927fba9ae70d3a885e0dab83551ef5e06bf3fdd))

### Fixes

- fix: removed some cases (Venkat - [798a6ef](https://github.com/contentstack/live-preview-sdk/commit/798a6ef0bd3f194d3841727657585ca6d700a307))
- fix: code cleaning (Venkat - [d25210f](https://github.com/contentstack/live-preview-sdk/commit/d25210f1a4e2e2471d0a1f47a569f62f886e314f))
- fix: missing init data (Faraaz Biyabani - [90b7d60](https://github.com/contentstack/live-preview-sdk/commit/90b7d60991f59b8dea67944fb6519fe5a7ef604e))
- fix: return the data when mode is builder (Deepak Kharah - [94891b9](https://github.com/contentstack/live-preview-sdk/commit/94891b90b9238beba745446dc6040a6323576a3c))
- fix: code cleaning (Venkat - [376d731](https://github.com/contentstack/live-preview-sdk/commit/376d73157033d2d0c18f075332dae50330885bc5))
- fix: test case failure in `fieldLabelWrapper` (hiteshshetty-dev - [a607170](https://github.com/contentstack/live-preview-sdk/commit/a607170beb43dd228528a1a1755fb2667469d1b0))
- fix: code cleaning (Venkat - [f33a11e](https://github.com/contentstack/live-preview-sdk/commit/f33a11e827ac51a4e9785199acc38924c8e32980))
- fix: missing properties in destory fn (hiteshshetty-dev - [2999970](https://github.com/contentstack/live-preview-sdk/commit/2999970a88679ff45d77ea1579cfc555969486f2))
- fix: code cleaning (Venkat - [211617a](https://github.com/contentstack/live-preview-sdk/commit/211617afa79c1427e7cee8dce60114c96174eec9))
- fix: tsup was building test cases (Deepak Kharah - [9e0bfae](https://github.com/contentstack/live-preview-sdk/commit/9e0bfaea989d69d0e4ffa14f94ee76d48714bcec))
- fix: LP SDK build issues (hiteshshetty-dev - [1c9a54d](https://github.com/contentstack/live-preview-sdk/commit/1c9a54d6848863fda18e765b32c98c1e12064e68))
- fix: Unique Validation is added (Venkat - [174740d](https://github.com/contentstack/live-preview-sdk/commit/174740dee2cac01b51986fbf2decaf54a0470584))
- fix: removed when not needed (Venkat - [5b2bad6](https://github.com/contentstack/live-preview-sdk/commit/5b2bad6c5317fbb57e644ea420bcc5e1bc5efeb9))
- fix: use preact jsx runtime (Kirtesh Suthar - [b8e2dc5](https://github.com/contentstack/live-preview-sdk/commit/b8e2dc53a68d5fdfddfd779018e63c8a83771dba))
- fix: handle Image and Link Field for fieldPath (Venkat - [c8cd2fe](https://github.com/contentstack/live-preview-sdk/commit/c8cd2fe9d05455777634c2aab28588e34629d5c5))
- fix: code cleaning (Venkat - [7aff68a](https://github.com/contentstack/live-preview-sdk/commit/7aff68af65966996dfd3a4af5b629c110669f4ea))
- fix: remove leading dot from class names in variant field handling (hiteshshetty-dev - [88519ac](https://github.com/contentstack/live-preview-sdk/commit/88519ac447bae95cbf530f9abb53edbcc1692a35))
- fix: rename prepack script to prepare for consistency (hiteshshetty-dev - [a382d90](https://github.com/contentstack/live-preview-sdk/commit/a382d905ff886b95bc8d6f3a009c33d362e1e8f2))
- fix: add support for focused state (hiteshshetty-dev - [fe9e0f1](https://github.com/contentstack/live-preview-sdk/commit/fe9e0f16e54a7e0c2ea37ad5da1bd4d5bc862ff6))
- fix: add test cases for shouldRenderEditButton and toggleEditButtonElement (Vishvam10 - [f5944a5](https://github.com/contentstack/live-preview-sdk/commit/f5944a5656cc358b94c5bcdb07a958acde1a9423))
- fix: updated test snapshots in liveEditor (Vishvam10 - [2038712](https://github.com/contentstack/live-preview-sdk/commit/20387127a85f497c1aa73970e47d3fea551f48c7))
- fix: multiple add instance buttons not shown while hovering (Vishvam10 - [e58df20](https://github.com/contentstack/live-preview-sdk/commit/e58df20b784c85d569f0da520b803bf38a320edb))
- fix: incorrect focus on blocks field instead of newly added block (Faraaz Biyabani - [9b7c776](https://github.com/contentstack/live-preview-sdk/commit/9b7c776bfad219c04ef76b65ca287178e25e890e))
- fix: single line line break and unnecessary psuedo editable due to nbsp (Faraaz Biyabani - [63d2f6a](https://github.com/contentstack/live-preview-sdk/commit/63d2f6a0f9a44d95ff1a1e7c417d1a4ee30fd410))
- fix: moved global state into VIsualEditor class and updated params.ts to types.ts (Vishvam10 - [e211d2d](https://github.com/contentstack/live-preview-sdk/commit/e211d2dcd0e7ce23e680dccc0505ea2fccf52e44))
- fix: resolve overlay issue occurring upon clicking the visual editor wrapper element (Vishvam10 - [64d7f3d](https://github.com/contentstack/live-preview-sdk/commit/64d7f3d86ac38b963d8202805adc9490407a6028))
- fix: eslint errors, add return types and updated interfaces to types (Vishvam10 - [59a3ca0](https://github.com/contentstack/live-preview-sdk/commit/59a3ca0a1cfc070a65ba448337029d853bc2be54))
- fix: remove invalid workflow files (Deepak Kharah - [a4f1a80](https://github.com/contentstack/live-preview-sdk/commit/a4f1a801e207021ed1ad80cf7c9437b8ed824ecb))
- fix: remove sendPostmessageToWindow (Vishvam10 - [1daf71a](https://github.com/contentstack/live-preview-sdk/commit/1daf71a58fe1a857459b271fc268b9fcf89c2faf))
- fix: improve test cases for getExpectedFieldData (Vishvam10 - [391ebe9](https://github.com/contentstack/live-preview-sdk/commit/391ebe96f86f6369bf286fc13fbcf821f6c1503c))
- fix: improve test cases for StartEditingButtonComponent (Vishvam10 - [93cb9f0](https://github.com/contentstack/live-preview-sdk/commit/93cb9f0fa4c5d6c5189da9c7a9c0642ae448a5ec))
- fix: convert methods to anonymous functions (Deepak Kharah - [1ed5f7b](https://github.com/contentstack/live-preview-sdk/commit/1ed5f7b98bfb2a24e661a5699e5f669cc1bf7c6f))
- fix: sidebar load issue and minor bug fixes in tests (Vishvam10 - [853b1ae](https://github.com/contentstack/live-preview-sdk/commit/853b1aed803992367d2e2694de6a0a57dbb9468d))
- fix: breaking test cases (hiteshshetty-dev - [da46a55](https://github.com/contentstack/live-preview-sdk/commit/da46a557a5e83ad62687bf38f18b53fe641978df))
- fix: static method cannot be called using this (Deepak Kharah - [3d9347a](https://github.com/contentstack/live-preview-sdk/commit/3d9347a7e57c3f18dd51dc5c0cf1ec00e6dc2f71))
- fix: import and tests in inIframe function (Vishvam10 - [6806ffb](https://github.com/contentstack/live-preview-sdk/commit/6806ffb630d7353a57e443f09c91e7466ad8dbb2))
- fix: multiple CT fetch on hover (hiteshshetty-dev - [f64ad4b](https://github.com/contentstack/live-preview-sdk/commit/f64ad4ba8324a9a204dc064ddcb63ef5495849fa))
- fix: hide/show cursor when pointer leaves/enters canvas (Faraaz Biyabani - [4adc1dc](https://github.com/contentstack/live-preview-sdk/commit/4adc1dcdab891443f958557aca306927a83e5a4a))
- fix: added resizeobserver mock for failing cases (Jayesh Deorukhkar - [eaa7c3a](https://github.com/contentstack/live-preview-sdk/commit/eaa7c3a9286c0ca0ece700e174d44a3c7f360a98))
- fix: incorrect query selector in focusedToolbarElement and remove mouseOver listener (Vishvam10 - [e97f3b2](https://github.com/contentstack/live-preview-sdk/commit/e97f3b2bd89fa6ee365106fb548867178076985f))
- fix: start editing button did not work (Deepak Kharah - [9e4e31d](https://github.com/contentstack/live-preview-sdk/commit/9e4e31dd497c63471a935cd9789de51f29e608b2))
- fix: fix incorrect filename (Deepak Kharah - [ef47dda](https://github.com/contentstack/live-preview-sdk/commit/ef47dda40fee326dfac3c4a9aa76c25900653f41))
- fix: remove unavailable repo (Deepak Kharah - [ab37513](https://github.com/contentstack/live-preview-sdk/commit/ab37513aac74e7f0f9142921ed945b1d6bc08c8b))
- fix: re-add .husky folder after deletion (Vishvam10 - [7415e8f](https://github.com/contentstack/live-preview-sdk/commit/7415e8fb102d91ea22e805684fe13cca081a328a))
- fix: minor bug in handle link click event in live preview test (Vishvam10 - [ced1596](https://github.com/contentstack/live-preview-sdk/commit/ced159680407c1afd38b9b90509840a15ecae643))
- fix: add proper check condition before updating focus (Jayesh Deorukhkar - [7bacffa](https://github.com/contentstack/live-preview-sdk/commit/7bacffa3872ed583649782d55680dbb461924885))
- fix: remove edit button from visual editor (Vishvam10 - [bcebd06](https://github.com/contentstack/live-preview-sdk/commit/bcebd06d4ca64ea1cbe40ab3fee9bcad141c43e6))
- fix: changing function to arrow (Jayesh Deorukhkar - [795b874](https://github.com/contentstack/live-preview-sdk/commit/795b874eb656493e0ddb228f17520970e0879a96))
- fix: update data-csle tag (Deepak Kharah - [67329e8](https://github.com/contentstack/live-preview-sdk/commit/67329e89267725932de6b3430d725922e9cd7b4d))
- fix: rename liveEditorPostMessage to livePreviewPostMessage (Deepak Kharah - [2556ef6](https://github.com/contentstack/live-preview-sdk/commit/2556ef6852c4b41edd2ca2585a7d9d90d8713ee3))
- fix: cursor not visible in normal operation (Deepak Kharah - [25ad0c6](https://github.com/contentstack/live-preview-sdk/commit/25ad0c694a83098358fe36f8ed6e0739d3163a0d))
- fix: remove unintented style changes (Jayesh Deorukhkar - [0c0308f](https://github.com/contentstack/live-preview-sdk/commit/0c0308fe87a1dddc4edeedb59f86c9e1374d9bdd))
- fix: adv post message use to emit debug logs. (Deepak Kharah - [f780724](https://github.com/contentstack/live-preview-sdk/commit/f780724ac5b6df0a1e598291e768d57f27d53059))
- fix: version is number and not string (Deepak Kharah - [75cade0](https://github.com/contentstack/live-preview-sdk/commit/75cade01b5b7dd4390235cfd5712cb4d1bf3ba25))
- fix: highlight issue on few fields (Vishvam10 - [63aaf0b](https://github.com/contentstack/live-preview-sdk/commit/63aaf0b530a4b29e3c9d7a3fa963864043152c03))
- fix: remove the underline from start editing button (Deepak Kharah - [ed71504](https://github.com/contentstack/live-preview-sdk/commit/ed71504c955c2a86dd719cfd157ab4cac4d7c1f3))

### Chores And Housekeeping

- chore: remove doc (Deepak Kharah - [2974d51](https://github.com/contentstack/live-preview-sdk/commit/2974d5151be53b906b6657008ebe1386727b8f99))
- chore: use package to check for regex vulnerability (Deepak Kharah - [cb81128](https://github.com/contentstack/live-preview-sdk/commit/cb811288ef614976a6df0db9bc7bcf4b250b87ca))
- chore: not send update on noTrigger (Sairaj Chouhan - [ad600f6](https://github.com/contentstack/live-preview-sdk/commit/ad600f6337fe543274bc546c73e441a205f83d30))
- chore: remove cursor styles of button and anchors (Sairaj Chouhan - [3c75a7e](https://github.com/contentstack/live-preview-sdk/commit/3c75a7ecb828143949a19b6b273acd5da14eadcb))
- chore: fix test cases (hiteshshetty-dev - [22ab4c2](https://github.com/contentstack/live-preview-sdk/commit/22ab4c2cd8e0179735049a2164abe53bc4d37e0e))
- chore: fix long running test for `fieldToolbar` (hiteshshetty-dev - [136c030](https://github.com/contentstack/live-preview-sdk/commit/136c030c9010f3d5eef74d666128be91780b169b))
- chore: add conditional chain option for variant check (hiteshshetty-dev - [bfa23d1](https://github.com/contentstack/live-preview-sdk/commit/bfa23d1d77cdf2f443dddc43181f399d706b7217))
- chore: fix test cases for VB (hiteshshetty-dev - [e9b7e17](https://github.com/contentstack/live-preview-sdk/commit/e9b7e175d6bd6fb5ae8904b91cc4b1d95c0caaff))
- chore: add coverage dependency and update live preview test assertions (hiteshshetty-dev - [9197194](https://github.com/contentstack/live-preview-sdk/commit/9197194f1337774ce416bea2a0a2a4f2f5003d23))
- chore: add optional dependencies for Rollup packages (hiteshshetty-dev - [d429835](https://github.com/contentstack/live-preview-sdk/commit/d429835b9fcee9d6ef13442ca33207d22576d0e0))
- chore: show error on wrong cslp tag (Sairaj Chouhan - [ac4fd3d](https://github.com/contentstack/live-preview-sdk/commit/ac4fd3d4e6036f363f7fbc4c4402f80c779d9060))
- chore: skip some tests (Faraaz Biyabani - [7251fac](https://github.com/contentstack/live-preview-sdk/commit/7251facc90feada9fd96446fbbac0bd33e053c6b))
- chore: error handling for events that receive data from builder (Sairaj Chouhan - [c6fb613](https://github.com/contentstack/live-preview-sdk/commit/c6fb613e89d04f8bc9191f36b546a7184e54d2fb))
- chore: remove redundant class names from snapshot tests (hiteshshetty-dev - [df40b78](https://github.com/contentstack/live-preview-sdk/commit/df40b7856885184351824086a7e2f1005567f9db))
- chore: show updated overlay after selecting variant (Sairaj Chouhan - [59847bb](https://github.com/contentstack/live-preview-sdk/commit/59847bb42c445e5a7b0d11d20d58fa1a053ff006))
- chore: handle post message fail case for cslp error (Sairaj Chouhan - [776301a](https://github.com/contentstack/live-preview-sdk/commit/776301abb60731bfb90ea3ca6b49bf2747a2d504))
- chore: move current field icon to a function (Sairaj Chouhan - [455d5aa](https://github.com/contentstack/live-preview-sdk/commit/455d5aa9d0f7034a6d9b7afd849499a2d6812a50))
- chore: merge commit (Sairaj Chouhan - [a6b1518](https://github.com/contentstack/live-preview-sdk/commit/a6b151829b3f3c369a994505bb4cfaf8a246355b))
- chore: remove anchor cursor style on hover (Sairaj Chouhan - [eecf4cc](https://github.com/contentstack/live-preview-sdk/commit/eecf4cc144a22bda7c14c6768406fac8df5e5675))
- chore: add optional chaining for process (hiteshshetty-dev - [8713bf7](https://github.com/contentstack/live-preview-sdk/commit/8713bf7481128c0e057ca1185a9a54e9a59797e7))
- chore: add padding to error box instead of button (Sairaj Chouhan - [eb8fb89](https://github.com/contentstack/live-preview-sdk/commit/eb8fb89ffa11c8b02bd5450b5e983d01f9608c04))
- chore: remove disabled state for toolbar button (Sairaj Chouhan - [838bea9](https://github.com/contentstack/live-preview-sdk/commit/838bea99f24fe0321a39b7b00bac7d5635dc445a))
- chore: remove duplicate imports (hiteshshetty-dev - [bb79a3a](https://github.com/contentstack/live-preview-sdk/commit/bb79a3a2435a120fb510bf3f8d01ec477e1d5fec))
- chore: add React import (Faraaz Biyabani - [c724e48](https://github.com/contentstack/live-preview-sdk/commit/c724e481f2bfbbf57b364902955d301383b30bfb))
- chore: move to vitest (Deepak Kharah - [fd4679b](https://github.com/contentstack/live-preview-sdk/commit/fd4679bafe105298eb134d6f3c90d8ff11870e3a))
- chore: use new eslint config (Deepak Kharah - [9181e27](https://github.com/contentstack/live-preview-sdk/commit/9181e2756d606ebf7f550e9fbbe67afd724bea69))
- chore: rename functions from editor to builder (Deepak Kharah - [770821f](https://github.com/contentstack/live-preview-sdk/commit/770821f37a1d3491e0fb87b7cc05b877011112b7))
- chore: rename live editor to visual builder (Deepak Kharah - [fe54ac6](https://github.com/contentstack/live-preview-sdk/commit/fe54ac6b42278d5842a2ae65418b83acc06e12ec))
- chore: rename files to visual builder (Deepak Kharah - [828a313](https://github.com/contentstack/live-preview-sdk/commit/828a3132b34307238e7517d3f7ac0f2e7ba8e86a))
- chore: remove unused dependencies (Deepak Kharah - [cf6dbbe](https://github.com/contentstack/live-preview-sdk/commit/cf6dbbe48e94e9eb9bbe2c0398fad45988ad5a0c))
- chore: update eslint to improve DXP (Deepak Kharah - [e7eaa4e](https://github.com/contentstack/live-preview-sdk/commit/e7eaa4e511b478d57b6df70c383388bebe2904c8))
- chore: add unit test workflow (Deepak Kharah - [d2acd7a](https://github.com/contentstack/live-preview-sdk/commit/d2acd7a32009d8d06a65a3b1e5063764e4b597af))
- chore: make tsup typesafe (Deepak Kharah - [e6534a3](https://github.com/contentstack/live-preview-sdk/commit/e6534a332101b2d02f10909c676559ef8127c257))
- chore: add alias for preact in tsup config (Kirtesh Suthar - [20bf81d](https://github.com/contentstack/live-preview-sdk/commit/20bf81db6f954dfad6a5b7f51fd1301bbcb89580))
- chore: add coverage for ci (Deepak Kharah - [69712be](https://github.com/contentstack/live-preview-sdk/commit/69712be698db175a976214605e60d19adf8d0a7e))
- chore: try fixing the preact tsup build issue (Kirtesh Suthar - [716e38e](https://github.com/contentstack/live-preview-sdk/commit/716e38ede514a6ac6b670dc35812014ec3d5b588))
- chore: setup preact config (Vishvam10 - [85397c6](https://github.com/contentstack/live-preview-sdk/commit/85397c6f3708cb93e110ee921c9f96ebbe038f0b))
- chore: add config files for testing Preact elements (Vishvam10 - [b8df4f6](https://github.com/contentstack/live-preview-sdk/commit/b8df4f634c9a843b898deb57494a0e261b15c148))
- chore: update dependencies from v2 (Deepak Kharah - [6398195](https://github.com/contentstack/live-preview-sdk/commit/63981955e7a53ac9846286f235a96b2f61cc3c7c))
- chore: update classnames to builder (Deepak Kharah - [c0b1a5d](https://github.com/contentstack/live-preview-sdk/commit/c0b1a5dba819e104becf9202c44164c14a396fb8))
- chore: snapshot update (hiteshshetty-dev - [228622f](https://github.com/contentstack/live-preview-sdk/commit/228622f87ac5aacfbe995c9639dacfd30bacb51f))
- chore: prettify code and changed visualEditorWrapper to visualEditorContainer (Vishvam10 - [c399a3e](https://github.com/contentstack/live-preview-sdk/commit/c399a3e103ae9da965a15ee1d0dd6d5539dc4431))
- chore: move lodash to lodash-es (Deepak Kharah - [52d5bc8](https://github.com/contentstack/live-preview-sdk/commit/52d5bc801fd1febc1dba131dc89665d63ce0994b))
- chore: remove as unknown and re-added commented test cases (Vishvam10 - [64ee0a9](https://github.com/contentstack/live-preview-sdk/commit/64ee0a926895f7af3eb3592ac9e33c8d6bfe9184))
- chore: re-add commented test cases (Vishvam10 - [ba63283](https://github.com/contentstack/live-preview-sdk/commit/ba632837d6fc92590844cbf1c3ea77c0ca4050b8))
- chore: lint and prettify code (Vishvam10 - [e7160df](https://github.com/contentstack/live-preview-sdk/commit/e7160df5e7db367922da3ae149d08cae95a6a416))
- chore: remove console.log and prettify code (Vishvam10 - [40485e4](https://github.com/contentstack/live-preview-sdk/commit/40485e48711b823face19d8921e5d2ef86578901))
- chore: sync timeline changes (Deepak Kharah - [0dfb717](https://github.com/contentstack/live-preview-sdk/commit/0dfb7176b8e0091c4d9711aaa5c47c6c489d72e2))
- chore: re-add commented test cases (Vishvam10 - [bc7fdcd](https://github.com/contentstack/live-preview-sdk/commit/bc7fdcde312cff189be9e15d554115dc1c0f67c9))
- chore: lint and prettify code (Vishvam10 - [378ea8b](https://github.com/contentstack/live-preview-sdk/commit/378ea8b3010196e591eae29b39c42ba8af04b07d))
- chore: update package version (Deepak Kharah - [7095c22](https://github.com/contentstack/live-preview-sdk/commit/7095c22898006518d3b3dae0d2073b8c21ed1d51))
- chore: rename it to test in test cases (Vishvam10 - [5f5ba6a](https://github.com/contentstack/live-preview-sdk/commit/5f5ba6aa78ef810a4847a46fc7b8772162010e18))
- chore: temp fix test case (hiteshshetty-dev - [cf567a0](https://github.com/contentstack/live-preview-sdk/commit/cf567a02669e345787559196d842530390ebe7cc))
- chore: sync hoc (Deepak Kharah - [9de5417](https://github.com/contentstack/live-preview-sdk/commit/9de5417c335a0ab403723c81e79e6d3f4234545d))
- chore: de-deuplicate cleanup logic (Faraaz Biyabani - [39fba5f](https://github.com/contentstack/live-preview-sdk/commit/39fba5fb83f8041c56763391b838c43b3ce03c16))
- chore: add comments to add debug module (Deepak Kharah - [fb42531](https://github.com/contentstack/live-preview-sdk/commit/fb42531a8133ab9c32a413ed8d476c20ff43576c))
- chore: sync preview module (Deepak Kharah - [d3220f7](https://github.com/contentstack/live-preview-sdk/commit/d3220f73275045114006132c79910b85e18e6488))
- chore: remove redundant .eslintrc.json (Deepak Kharah - [e6991f4](https://github.com/contentstack/live-preview-sdk/commit/e6991f414922c0965f4f5913fe42c1943763b4e9))
- chore: remove console.logs (Vishvam10 - [42a90fb](https://github.com/contentstack/live-preview-sdk/commit/42a90fbd8486e97ac3d20d49b4f7f186c73f1461))
- chore: removed unused imports and ts-nochecks (Vishvam10 - [887f70e](https://github.com/contentstack/live-preview-sdk/commit/887f70e56b3743223acae7e7f580d1726d4b2a61))
- chore: just-camel-case package for CSS styles and update adv-post-message (Vishvam10 - [d4793f3](https://github.com/contentstack/live-preview-sdk/commit/d4793f383b87faecc6237bd734c716d85735ab49))
- chore: fix vulnerabilities (Deepak Kharah - [737fa27](https://github.com/contentstack/live-preview-sdk/commit/737fa27a45f87b4910d33c5f603afd2edbd2ed17))
- chore: debug should come from config (Deepak Kharah - [2fe374d](https://github.com/contentstack/live-preview-sdk/commit/2fe374d8b9a3d1e8ded424a90c9b173f822aade2))
- chore: add data-testid to icons (Vishvam10 - [03efb1c](https://github.com/contentstack/live-preview-sdk/commit/03efb1c3b6b6a63a1344c6d2863126956fc88b15))
- chore: bump version from 2.0.0 to 3.0.0 (Faraaz Biyabani - [1a9ea82](https://github.com/contentstack/live-preview-sdk/commit/1a9ea822bcc4ebba4b9bd2091b9d88d9addfc58d))
- chore: rename getExpectedFieldData to getFieldData (Faraaz Biyabani - [73e8f44](https://github.com/contentstack/live-preview-sdk/commit/73e8f44bc9f4bd84f65ca22683c0d0cf8a2e4900))
- chore: add type for post message events (Deepak Kharah - [10a9099](https://github.com/contentstack/live-preview-sdk/commit/10a90991efc1861ea6e29073b84bca2da72a0742))
- chore: add jest function for mocking `on` (Sairaj Chouhan - [7618f4a](https://github.com/contentstack/live-preview-sdk/commit/7618f4a39bf4304f8a0e80650689a16052d905d1))
- chore: update script name (Deepak Kharah - [ae42b15](https://github.com/contentstack/live-preview-sdk/commit/ae42b15482fe81d9fc97485614a8dbdac6969758))
- chore: sync url change changes (Deepak Kharah - [1bf2f8a](https://github.com/contentstack/live-preview-sdk/commit/1bf2f8a586728ec1eeb1c4d1c30c79a608aab64c))
- chore: rename test file, fix import (Faraaz Biyabani - [5fe0b6e](https://github.com/contentstack/live-preview-sdk/commit/5fe0b6e2e86a74c28dd0a48abbd843c609989819))
- chore: add note regarding Esc unfocus shortuct (Faraaz Biyabani - [aeb3f89](https://github.com/contentstack/live-preview-sdk/commit/aeb3f89da490f2e21921541e68c28889e463ba11))

### Refactoring and Updates

- refactor: update Live Editor redirection URL to use "visual-builder" instead of "visual-editor" (hiteshshetty-dev - [c25e1cd](https://github.com/contentstack/live-preview-sdk/commit/c25e1cd9ca3c0ce9723c405405fb35078b7e79c4))
- refactor: move edit button into separate file (Deepak Kharah - [4ca01a0](https://github.com/contentstack/live-preview-sdk/commit/4ca01a0bb374b98b1bb0097a3d5716f91b67c15d))
- refactor: move files to appropriate modules (Deepak Kharah - [3bc7ba8](https://github.com/contentstack/live-preview-sdk/commit/3bc7ba8c69cf63d7555e753788346c7111e99a34))
- refactor: add state property to Config getter and setter and update associated functions (Vishvam10 - [0f4cb82](https://github.com/contentstack/live-preview-sdk/commit/0f4cb8214c954b93fd2f79c1152052c30f3a1234))
- refactor: organize event listeners into separate folders and introduce corresponding types (Vishvam10 - [1885c0c](https://github.com/contentstack/live-preview-sdk/commit/1885c0c98460455d93ed9261ef8187c470639d51))
- refactor: added wrapper methods to deal with preact components (Vishvam10 - [312f9f9](https://github.com/contentstack/live-preview-sdk/commit/312f9f967e787e47957071d5c609b06d62af8f20))
- refactor: made previousSelectedDom and previousHoveredTargetDom global (Vishvam10 - [49e8ad7](https://github.com/contentstack/live-preview-sdk/commit/49e8ad79eb8753aa468b40edac7cd136215f01a6))
- refactor: extracted components out of VisualEditor class (Vishvam10 - [d89bcdf](https://github.com/contentstack/live-preview-sdk/commit/d89bcdf7132a9ae1d140d1e18ea7fbc9082ecd48))
- refactor: break code into smaller chunks (Deepak Kharah - [086e4a3](https://github.com/contentstack/live-preview-sdk/commit/086e4a3c75ddbed8861a0d47fc4d8e9bdadb495c))
- refactor: focused toolbar logic into separate component with internal state management (Vishvam10 - [22a6174](https://github.com/contentstack/live-preview-sdk/commit/22a6174a7f22f0657b32d9d6cd972e87d2f43fda))
- refactor: extract getExpectedFieldData, getStyleOfAnElement and getChildrenDirection into a separate utils file (Vishvam10 - [72c9c9c](https://github.com/contentstack/live-preview-sdk/commit/72c9c9c37ef0f2aad1262f3fb7f48818118c732e))
- refactor: implement deepSignal into Config object (Vishvam10 - [2843bc0](https://github.com/contentstack/live-preview-sdk/commit/2843bc00e419cee62e3b5ad2b75f59e62fdf4454))
- refactor: mouse click events (Vishvam10 - [6608301](https://github.com/contentstack/live-preview-sdk/commit/6608301390605531bc08fa93220a98b594a4422b))
- refactor: converted icons (Vishvam10 - [6b6ec33](https://github.com/contentstack/live-preview-sdk/commit/6b6ec33821d279e27a658e4d700bc0076af599a4))
- refactor: move common schema type (Deepak Kharah - [37a9b37](https://github.com/contentstack/live-preview-sdk/commit/37a9b3730ed5fbcffb88260c5a0e321ac8089f91))
- refactor: remove unused exports (Deepak Kharah - [343a048](https://github.com/contentstack/live-preview-sdk/commit/343a048057948dcaa26ca3d68d8c4ed4dca69b8c))
- refactor: add signals to global state (Vishvam10 - [3ffd440](https://github.com/contentstack/live-preview-sdk/commit/3ffd4402d3058e2eb79cbe021dc8cb7039b62a72))
- refactor: moved getLiveEditorRedirectionUrl to a separate file (Vishvam10 - [26d6f4e](https://github.com/contentstack/live-preview-sdk/commit/26d6f4ea45316d432eddfb380a8e36650edcee6b))
- refactor: moved handleMoveInstance and handleDeleteInstance to a separate file (Vishvam10 - [e32b3e4](https://github.com/contentstack/live-preview-sdk/commit/e32b3e4021aee8b082e1e14a384ecb3abfe80fe9))
- refactor: moved getExpectedFieldData and getStyleOfAnElement tests (Vishvam10 - [fc118e1](https://github.com/contentstack/live-preview-sdk/commit/fc118e1f5799c9308f6c655d1e946563755d7866))
- refactor: remove unused variables (Deepak Kharah - [f956c77](https://github.com/contentstack/live-preview-sdk/commit/f956c77a9694b88126588f6f23b2fc3a770a07b7))

### Changes to Test Assests

- test: fix WIP (Faraaz Biyabani - [eeb20ca](https://github.com/contentstack/live-preview-sdk/commit/eeb20ca17aa7da5eb073e6b51d7a1bacf0bcf786))
- test: temp fix test cases (hiteshshetty-dev - [59a0b13](https://github.com/contentstack/live-preview-sdk/commit/59a0b13616bfdf60596c2d6dd593701d96a5c1f6))
- test: refactor visual builder tests for contenteditable elements (hiteshshetty-dev - [56e63b9](https://github.com/contentstack/live-preview-sdk/commit/56e63b9ae2b31b1144aebac176b180b01a614fce))
- test: increase timeout for visual builder contenteditable tests (hiteshshetty-dev - [d2c2210](https://github.com/contentstack/live-preview-sdk/commit/d2c2210ad11000f49f13de5c3e78b6ac6acf4ef3))
- test: remove console log from Live Preview HOC test (hiteshshetty-dev - [f116a96](https://github.com/contentstack/live-preview-sdk/commit/f116a96b09f95d55e4dd53275bab2b2164a334d2))
- test: fix existing test cases after major refactor (Deepak Kharah - [90e3d45](https://github.com/contentstack/live-preview-sdk/commit/90e3d4552a1c157c622129ccf44c3c0996457ebe))
- test: update test cases to support conditional ct (Deepak Kharah - [c22609c](https://github.com/contentstack/live-preview-sdk/commit/c22609c0e0865a4781cdd1b31132fe6f97b0b4bf))
- test: add cases for basic working (Deepak Kharah - [6ce1d79](https://github.com/contentstack/live-preview-sdk/commit/6ce1d7924a373ea0dad3a8e6809f07afc0f84a7d))
- test: update test cases for live preview (Deepak Kharah - [c4224c0](https://github.com/contentstack/live-preview-sdk/commit/c4224c00cb97253d52440bf9631066d0e02eea79))
- test: add cases for mode support (Deepak Kharah - [d0c20a4](https://github.com/contentstack/live-preview-sdk/commit/d0c20a4f24fb495c54489bbff7165d6d51aa333f))
- test: stack details in editor mode (Deepak Kharah - [423a511](https://github.com/contentstack/live-preview-sdk/commit/423a51101752b8b041018da2530e79d9eeb32e33))
- test: add cases for visual editor DOM (Deepak Kharah - [2340409](https://github.com/contentstack/live-preview-sdk/commit/23404093bed39fc78fa3c2725dd7ba1b5a13ea2a))
- test: add test for getEntryUidFromCurrentPage (Sairaj Chouhan - [e2a58d8](https://github.com/contentstack/live-preview-sdk/commit/e2a58d876363beaec057de7c1e5f8f033c906358))
- test: add cases for start editing button (Deepak Kharah - [e202936](https://github.com/contentstack/live-preview-sdk/commit/e20293697fb885febf7bfba64a31606ec86c3b35))
- test: add branch scenarios (Deepak Kharah - [ea93054](https://github.com/contentstack/live-preview-sdk/commit/ea930542a7c7f0dca162fb15bf0344d99e8588da))
- test: optimize import (Deepak Kharah - [5c625fb](https://github.com/contentstack/live-preview-sdk/commit/5c625fb3aa5b51fd9a829482f6e860a7b83ff1cb))
- test: update snapshots (Deepak Kharah - [64a9cd8](https://github.com/contentstack/live-preview-sdk/commit/64a9cd8d07b08bb4933ab9055745ee46bac83927))
- test: fix test cases (Deepak Kharah - [5743018](https://github.com/contentstack/live-preview-sdk/commit/5743018c71d66706cc76a06c3d7d7ae9d0a00ba5))

### General Changes

- variant icon in toolbar (Amey Shrivastava - [63be135](https://github.com/contentstack/live-preview-sdk/commit/63be1357d21b36f4981f934852f367e3d1d212ae))
- field focus toolbar re design update (devAyushDubey - [1868582](https://github.com/contentstack/live-preview-sdk/commit/1868582817e324a888f86e90949534694a859447))
- Tooltip Position Invert when space isn't available (Amey Shrivastava - [b26fb52](https://github.com/contentstack/live-preview-sdk/commit/b26fb5220edf1bbef510ac8e355bca5f1bb15055))
- position for multiple fields and fix tooltip css (Amey Shrivastava - [b9ab40c](https://github.com/contentstack/live-preview-sdk/commit/b9ab40ce5ebc64c29af26cef8d5295bba5ef0bf5))
- fix consequences of pr change (Srinadh Reddy - [ef40e05](https://github.com/contentstack/live-preview-sdk/commit/ef40e0516e9a242b1bd55cf79cbd436230165c7b))
- fixed test cases (devAyushDubey - [d2b5859](https://github.com/contentstack/live-preview-sdk/commit/d2b585979afa7daa1b05b40f87cf8769cee06ae2))
- fix remove handle focus event (Srinadh Reddy - [1548662](https://github.com/contentstack/live-preview-sdk/commit/1548662c51d4f4f3524e78c1f2a2fe3bac9b5104))
- Add Section & Comment Icon tooltip (Amey Shrivastava - [d31f6c0](https://github.com/contentstack/live-preview-sdk/commit/d31f6c0384383264bf896da961f41f7d9467401e))
- closeVariantDropdown instead of passing state setter (Amey Shrivastava - [b6addfd](https://github.com/contentstack/live-preview-sdk/commit/b6addfda16998197e17e96815c46826e0363a7bb))
- Keep Z Index of toolbar & its child elements at highest possible value (Amey Shrivastava - [e57e220](https://github.com/contentstack/live-preview-sdk/commit/e57e2201781e723ca30b0c170d549da65afb5980))
- update code to work only in case of single fields (Srinadh Reddy - [384d1a4](https://github.com/contentstack/live-preview-sdk/commit/384d1a446560c1745c7410c103f542208c40262a))
- fix pr changes (srinad007 - [ddf8b14](https://github.com/contentstack/live-preview-sdk/commit/ddf8b1428f7f55017a7f822cd41bd7614933ccc1))
- fix test cases (Srinadh Reddy - [d0d94e4](https://github.com/contentstack/live-preview-sdk/commit/d0d94e470acbeaf419fd71ad6e1cb6cd04c2d247))
- reduce z index of pseudo-editable-element to prevent overlap with toolbar / variant dropdown (Amey Shrivastava - [622ec61](https://github.com/contentstack/live-preview-sdk/commit/622ec615d62d1ffaaa471c0ed5efba7c9e19dc59))
- fix update z index (Srinadh Reddy - [786d4f8](https://github.com/contentstack/live-preview-sdk/commit/786d4f8b27ee0c047b4b70ebf0ef55f6fd8dc993))
- increase z-index (Amey Shrivastava - [dcbc424](https://github.com/contentstack/live-preview-sdk/commit/dcbc424a43ad82b365065c87d89178ce355a55d2))
- Merge pull request #286 from contentstack/hide-focus-on-variant-change (Sairaj - [cabe89c](https://github.com/contentstack/live-preview-sdk/commit/cabe89c95dbeda1f70bdffbd5a62b05ed129f88d))
- Merge pull request #278 from contentstack/VE-3494-remove-cursor-pointer-on-links (Sairaj - [c572486](https://github.com/contentstack/live-preview-sdk/commit/c5724868d463277d452a8e9df37a0f6422e4d361))
- Updated codeowners (Aravind Kumar - [250bcd3](https://github.com/contentstack/live-preview-sdk/commit/250bcd3ac201a0adaffd856f38adac1922787de4))
- codeql-analysis.yml (Aravind Kumar - [8d21d3b](https://github.com/contentstack/live-preview-sdk/commit/8d21d3b2f80f70a094ba8661bcda8dd91f3a3810))
- sast-scan.yml (Aravind Kumar - [79c20c3](https://github.com/contentstack/live-preview-sdk/commit/79c20c36ef282540f6d4be8db593b2a92463bf26))
- jira.yml (Aravind Kumar - [8dda73f](https://github.com/contentstack/live-preview-sdk/commit/8dda73f6b2e3270e075bc22e1eb2a630f66acdba))
- sca-scan.yml (Aravind Kumar - [4fba641](https://github.com/contentstack/live-preview-sdk/commit/4fba641d500fd71189c0a8f61f37fa8a39757a0b))
- Merge pull request #271 from contentstack/VE-3549 (Sairaj - [3f0664a](https://github.com/contentstack/live-preview-sdk/commit/3f0664aea79b9df03faa32bef4ea09d5c0b92ec6))
- add variant revert component (Amey Shrivastava - [c3aec57](https://github.com/contentstack/live-preview-sdk/commit/c3aec57fd92ac6f8d514f1987203f1b8f0bcbdde))
- allow focus shift on external field changes (devAyushDubey - [a1befd6](https://github.com/contentstack/live-preview-sdk/commit/a1befd68f232e5054dbf215f17eedc0ccad489ec))
- Fix Custom Cursor Issues (Flicker & Additional Space) (Amey Shrivastava - [b297c82](https://github.com/contentstack/live-preview-sdk/commit/b297c821849fe761a70198b60a8474efada0def8))
- conflict fix (Venkat - [808e4e6](https://github.com/contentstack/live-preview-sdk/commit/808e4e6e51370e0d792a2ce8e1def65938039d6b))
- Keep class but remove style (Amey Shrivastava - [131d9a2](https://github.com/contentstack/live-preview-sdk/commit/131d9a2729cd16d4c7ba115962eec36484bfd208))
- Cleanup overlay styles: Top, Right, Bottom, Left & Outline | IFrame Body Height Mismatch due to residual overlay (Amey Shrivastava - [8e4939e](https://github.com/contentstack/live-preview-sdk/commit/8e4939efdd051e1c72b3fc74714f6e8ac1851ba6))
- send-variant-revert-action-trigger (Amey Shrivastava - [058c5fc](https://github.com/contentstack/live-preview-sdk/commit/058c5fc5a37a03b6c39a9c2ce65ecbfb6230f6f0))
- test cases fix (devAyushDubey - [9d30360](https://github.com/contentstack/live-preview-sdk/commit/9d3036064e54929a7c57d4d7b7b33a8cdf39c5ce))
- Increase VARIANT_UPDATE_DELAY_MS timeout to 8 seconds (Amey Shrivastava - [ffd898e](https://github.com/contentstack/live-preview-sdk/commit/ffd898ed679d525548a198d4d27e2ce56be14af9))
- Comment changes (Venkat - [a137476](https://github.com/contentstack/live-preview-sdk/commit/a1374760045c2803f7f881eda86b01bb350070ab))
- Merge pull request #267 from contentstack/VE-3494-cursor-pointer-on-links (Sairaj - [f1dafc6](https://github.com/contentstack/live-preview-sdk/commit/f1dafc6873d003dfe5ed767929252df8fbfd8a94))
- Merge pull request #260 from contentstack/VE-3494-cursor-pointer-on-links (Sairaj - [5b6e648](https://github.com/contentstack/live-preview-sdk/commit/5b6e6482b1dafb97ab48b98b59ea8c710d2e955f))
- mode in init event (devAyushDubey - [c33b397](https://github.com/contentstack/live-preview-sdk/commit/c33b39736eaf32b8133e042ee7bb1045dfa2b4ea))
- Merge pull request #250 from contentstack/handle-postmessage-fail-cases (Sairaj - [8a72c9e](https://github.com/contentstack/live-preview-sdk/commit/8a72c9ea09c118db88f8d8029af1f23c0b962e7b))
- exported VB_EmptyBlockParentClass (devAyushDubey - [80e0c88](https://github.com/contentstack/live-preview-sdk/commit/80e0c8892982fa6f47230146de86cf8f56c5b65f))
- Merge pull request #249 from contentstack/handle-invalid-clsp-tags (Sairaj - [317618b](https://github.com/contentstack/live-preview-sdk/commit/317618bf14cfbf215cc8feda3cf71859d9b9dab1))
- changes for supporting esbuild, removed alias for preact/compat (devAyushDubey - [89e08f9](https://github.com/contentstack/live-preview-sdk/commit/89e08f978c8c6a05b22d790d23aae8f60359a7a7))
- fix merge issues for incompatible errors (Srinadh Reddy - [8768adf](https://github.com/contentstack/live-preview-sdk/commit/8768adf5eb22b5938a3922cf0b0a09f37dd81019))
- Bug Fixing on taxonom and group field (Venkat - [3bc9da0](https://github.com/contentstack/live-preview-sdk/commit/3bc9da0a445a619bf32520254c4e9833fb40d917))
- Bug Fixing on Focus Field (Venkat - [701dd9f](https://github.com/contentstack/live-preview-sdk/commit/701dd9f58051d8af28fe2fada66bc0d0a7c22586))
- payload changes on scroll event (Venkat - [567e39d](https://github.com/contentstack/live-preview-sdk/commit/567e39dcf5afb34485f61aa0275cc25909629295))
- Open Modal and scroll field event data payload changes (Venkat - [0982c1a](https://github.com/contentstack/live-preview-sdk/commit/0982c1a3375822c4cba4730e4814601e801231ae))
- Get DiscussionId Post message Payload changes (Venkat - [96d23a0](https://github.com/contentstack/live-preview-sdk/commit/96d23a0e0892a79704f120ad62bd95b5e26e7a7f))
- added custom mouse z-index (devAyushDubey - [65e9bf0](https://github.com/contentstack/live-preview-sdk/commit/65e9bf0158d9aef9a00912a655b7a18fc28c084a))
- only changed if stack.config passed (devAyushDubey - [3a3b99c](https://github.com/contentstack/live-preview-sdk/commit/3a3b99c7ba03680ba4ab1961fc8d02541de1d67d))
- VC-115/live-editor-support merge (devAyushDubey - [e424bd4](https://github.com/contentstack/live-preview-sdk/commit/e424bd4c84b2c2a12247f0b23df8153bc02261e7))
- Get DiscussionId Post message Payload changes (Venkat - [f731ef1](https://github.com/contentstack/live-preview-sdk/commit/f731ef10b62fd7c98bdc4d886f7e7b85e9187163))
- merged with VC-115/live-editor-support (Venkat - [5037257](https://github.com/contentstack/live-preview-sdk/commit/5037257feadb4306e4aa9601fbe2c1bdc1987f1c))
- add: test cases for window.onClick method (Vishvam10 - [f552048](https://github.com/contentstack/live-preview-sdk/commit/f5520488e72bab42aeee5ac99368960c88227494))
- add: on focus send DOMEditStack (RavenColEvol - [85b4f27](https://github.com/contentstack/live-preview-sdk/commit/85b4f27eecc8b574c705da30a2e8b184e2d9de29))
- fix : revert Config.get method to return the entire object and update test cases accordingly (Vishvam10 - [79323ed](https://github.com/contentstack/live-preview-sdk/commit/79323ed40f320ac55e53df03f2c07ddec19c0d0b))
- add: preact effect to handle windowType change and update existing test cases (Vishvam10 - [1244b76](https://github.com/contentstack/live-preview-sdk/commit/1244b762e06bbda8cac69642a825dedd746f6991))
- add: test cases for visualEditorInput (Vishvam10 - [5dd3a62](https://github.com/contentstack/live-preview-sdk/commit/5dd3a621661cb2e684ad9d2ca3106ee9eddccb8a))
- add: test cases for updated Config object (Vishvam10 - [5485bc8](https://github.com/contentstack/live-preview-sdk/commit/5485bc842f48ce6b8131fd14afcb2bb9839d520e))
- add: test cases for liveEditor utils (Vishvam10 - [b6e2b32](https://github.com/contentstack/live-preview-sdk/commit/b6e2b3237fe1876c9c3fc199b75640d36f02aec6))
- add: test cases for add instance button (Vishvam10 - [dc5cd49](https://github.com/contentstack/live-preview-sdk/commit/dc5cd498a7fdbfd8db7bbe2fbe0fca2a01732791))
- add: test cases for fieldLabelWrapper, focusOverlayWrapper and startEditingButton (Vishvam10 - [2fbdff5](https://github.com/contentstack/live-preview-sdk/commit/2fbdff5efe4fe4bd63f99d37baea53d2b3b6e454))
- add: test cases for visualEditor (Vishvam10 - [197867a](https://github.com/contentstack/live-preview-sdk/commit/197867a471e16c78f0caca4ac0abca93ff6ff656))
- add: test cases for appendFieldPathDropdown (Vishvam10 - [159a94d](https://github.com/contentstack/live-preview-sdk/commit/159a94d86af71bfc48cfe90fda3bc598659234da))
- Introduced EmptyBlocks for handling empty block entries (devAyushDubey - [b4c4055](https://github.com/contentstack/live-preview-sdk/commit/b4c4055b6c3691bad51fce9b58ff75cc1ec54220))
- add: test cases for addInstanceButton, icons and replaceAssetButton (Vishvam10 - [d389c59](https://github.com/contentstack/live-preview-sdk/commit/d389c5930929fd10a2c64ac0c54c88a2eb86ac22))
- Introduced Instance's fieldPathWithIndex in post-message payloads and fixed tests (csAyushDubey - [559aba6](https://github.com/contentstack/live-preview-sdk/commit/559aba65f9866188bdb9be8ca6ae2559566ed303))
- add: test cases for multipleFieldToolbar (Vishvam10 - [59631e7](https://github.com/contentstack/live-preview-sdk/commit/59631e7d031a0d9a23e8e29a706d201a6532023a))
- add: test cases for addLivePreviewQueryTags (Vishvam10 - [ba20f18](https://github.com/contentstack/live-preview-sdk/commit/ba20f18523aab2ab25324243817b8249a939a960))
- add: test cases for psuedoEditableField (Vishvam10 - [b2bfc02](https://github.com/contentstack/live-preview-sdk/commit/b2bfc025ef89adb17e1935e6c966df174e14163a))
- add support to highlight variants (Srinadh Reddy - [5feb7ca](https://github.com/contentstack/live-preview-sdk/commit/5feb7ca3b23f1291381b3e248e2e166eb288e27e))
- multiline field handling support (devAyushDubey - [e488d2c](https://github.com/contentstack/live-preview-sdk/commit/e488d2c31efd847357126401b7a2a73409f471d3))
- add: test cases for instanceHandler (Vishvam10 - [f220a1a](https://github.com/contentstack/live-preview-sdk/commit/f220a1a773f16d799fb08c5109a028c5df14147f))
- add: test cases for replaceAssetButton and startEditingButton (Vishvam10 - [5e1c67f](https://github.com/contentstack/live-preview-sdk/commit/5e1c67fc3d051dcb210975a978a507b5b52a75f1))
- Handles changes in element positions due to sidebar toggling or window resizing (Amey Shrivastava - [cbe317f](https://github.com/contentstack/live-preview-sdk/commit/cbe317f8932416840e67b594f624c2bfdfa32a00))
- add: test cases for PublicLogger (Vishvam10 - [ec92044](https://github.com/contentstack/live-preview-sdk/commit/ec92044579ef417ebea47e951feb2f22589b5ef9))
- add: test cases for getCamelCaseStyles (Vishvam10 - [c873eea](https://github.com/contentstack/live-preview-sdk/commit/c873eeaddf888eb94fadd5cc687afa9ddb58d39f))
- Implemented logic for cursor behavior on hover and click (devAyushDubey - [048b162](https://github.com/contentstack/live-preview-sdk/commit/048b162a4125d8a113b8bb98d5f03d56a76f3423))
- add: test cases for removeFromOnChangeSubscribers (Vishvam10 - [edc7a82](https://github.com/contentstack/live-preview-sdk/commit/edc7a82ece1241e3f3ef51481bccdf6a3af082be))
- Moved + button render code from mouse hover to click (devAyushDubey - [57201ee](https://github.com/contentstack/live-preview-sdk/commit/57201ee06ad80ef743125efc76fd0fcc68e2664c))
- add: test cases for inIframe (Vishvam10 - [379062b](https://github.com/contentstack/live-preview-sdk/commit/379062bae754779dbf5e2c68e9ff1df7ead098d6))
- add support to edit highlighted variant fields (Srinadh Reddy - [bfbe560](https://github.com/contentstack/live-preview-sdk/commit/bfbe560abadf4f4634c5a30d3a9523507bb6c507))
- Get emptyBlockParent from fieldSchema (devAyushDubey - [a3b0b22](https://github.com/contentstack/live-preview-sdk/commit/a3b0b22254c293637cc9b016132a88b6c0b18f84))
- Overlay changes to make anchor tags unclickable (devAyushDubey - [4bfa3cb](https://github.com/contentstack/live-preview-sdk/commit/4bfa3cb776e88b54858629682e47a0590726dbdd))
- add: classnames package (Vishvam10 - [c53a591](https://github.com/contentstack/live-preview-sdk/commit/c53a591786d415df23aba2f63d5fb65f4163ad5e))
- update cslp in extractclsp function (srinad007 - [938e325](https://github.com/contentstack/live-preview-sdk/commit/938e325c83056a20f6e3620bb98330f33b691c56))
- overlay style and calculation fix (devAyushDubey - [8e0ecaf](https://github.com/contentstack/live-preview-sdk/commit/8e0ecafa46c09ee18116ae89e371493e45799d1c))
- add: deepSignal package (Vishvam10 - [5826587](https://github.com/contentstack/live-preview-sdk/commit/58265878f214c290bf3cc2289bfb63b034d86ae3))
- adjustedDistanceFromTop (Amey Shrivastava - [4c583a0](https://github.com/contentstack/live-preview-sdk/commit/4c583a0a1933acb638470c518793b48716da4e27))
- fixed toolbar append issue (devAyushDubey - [79dca74](https://github.com/contentstack/live-preview-sdk/commit/79dca742ece76f15540a2ae1898dc14359989fc7))
- Hover on closest ancestor parent cslp (editableElement) (devAyushDubey - [f0e96cc](https://github.com/contentstack/live-preview-sdk/commit/f0e96cc87e67e22117522e9a2a4be470e8a2b987))
- create resizeEventHandler & handle window.removeEventListener (Amey Shrivastava - [ae72d88](https://github.com/contentstack/live-preview-sdk/commit/ae72d88cbe4ebd5428d9ab4eb75ed42faa4d621a))
- multiline text field enhancements (devAyushDubey - [eb01407](https://github.com/contentstack/live-preview-sdk/commit/eb0140792649bce819f59068edb2c5e836eca708))
- Calculation with different approach considering scroll bar (devAyushDubey - [a110168](https://github.com/contentstack/live-preview-sdk/commit/a110168a788741c03f9fa3321dc09f9f4d09eae5))
- reference multiple logic to generateToolbar (devAyushDubey - [15de2a9](https://github.com/contentstack/live-preview-sdk/commit/15de2a9d664940193ef0aa14ad1fb9a7071bb6eb))
- Toolbar dropdown button hover and contenteditable outline changes (devAyushDubey - [75de89b](https://github.com/contentstack/live-preview-sdk/commit/75de89b4bffde24ff4af595e7a93c56c5358f5db))
- test fix (SAYAN BAKSHI - [104dca6](https://github.com/contentstack/live-preview-sdk/commit/104dca650550453489a909527e7195df458b6749))
- Fix pusedoEditableElement's position (SAYAN BAKSHI - [0987d48](https://github.com/contentstack/live-preview-sdk/commit/0987d486e0c7644105067f015f75038d542c4d50))
- multiline changes to pseudo-editable (devAyushDubey - [1ea6c5a](https://github.com/contentstack/live-preview-sdk/commit/1ea6c5a4069338430785fb46ab8e5d55ccc21668))
- Prevent text cutoff on toolbar left edge by introducing a minimum buffer (Amey Shrivastava - [b943e5e](https://github.com/contentstack/live-preview-sdk/commit/b943e5ec049bfdb03f997a0d45a58e4dd1f4f65f))
- User website: Horizontal Scroll considerations (Amey Shrivastava - [6abb969](https://github.com/contentstack/live-preview-sdk/commit/6abb969ada5c07d006ee92853d1c255d120c3d94))
- minor change (devAyushDubey - [b51986d](https://github.com/contentstack/live-preview-sdk/commit/b51986d3cf7b66be205ab350c9a6ed6ad4d2d506))
- complete mouse click blocking and canvas URL field editing (devAyushDubey - [170d339](https://github.com/contentstack/live-preview-sdk/commit/170d339a0336f8ae1ae3201837bf684ee5fc622d))
- small fix (devAyushDubey - [8c6dbf8](https://github.com/contentstack/live-preview-sdk/commit/8c6dbf873ebd6850e00b9481fed3c4eefc940c1f))
- Style changes for editable elements (devAyushDubey - [ebea5df](https://github.com/contentstack/live-preview-sdk/commit/ebea5dfd914899c9125a10f0f39d573c4d87e787))
- Calculation fix for overlay (devAyushDubey - [fa0da55](https://github.com/contentstack/live-preview-sdk/commit/fa0da550acc5ade04b152d689ab4c60ff10117d5))
- icon for taxonomy on custom cursor (devAyushDubey - [3955e78](https://github.com/contentstack/live-preview-sdk/commit/3955e78c5b9a34cce8ee586258ca948bbcded5ee))
- fix type errors for variant (srinad007 - [1d542e5](https://github.com/contentstack/live-preview-sdk/commit/1d542e5617be449c3ce6f0efcf3b73e35eedab34))
- taking into account empty block for click blocking (devAyushDubey - [a8366a3](https://github.com/contentstack/live-preview-sdk/commit/a8366a3dfd2398fde8ec2bf0f6d0b0902b195694))
- Update tooltip hover styles (Amey Shrivastava - [66b7fa2](https://github.com/contentstack/live-preview-sdk/commit/66b7fa278000807ce82b733a17dc02e0b4d4b793))
- Right overlay width changes (devAyushDubey - [d24fce9](https://github.com/contentstack/live-preview-sdk/commit/d24fce916507071b1a074f4b64219b375bafdf1d))
- Added comments (devAyushDubey - [dbcfeb7](https://github.com/contentstack/live-preview-sdk/commit/dbcfeb79dfc753f81b1dc0567ba757e2774bcf4e))
- removed console.log (devAyushDubey - [2ca7128](https://github.com/contentstack/live-preview-sdk/commit/2ca7128d0963eaced8c77319cff914d5b2091508))
- style for pseudo-editable (devAyushDubey - [f1b90bd](https://github.com/contentstack/live-preview-sdk/commit/f1b90bd8183753b62b7337513836fe2e5df4c3c4))
- removed unused params (devAyushDubey - [c3ad457](https://github.com/contentstack/live-preview-sdk/commit/c3ad457ca763494bc7fba4d811c5bbee7fb8a4ca))

## [v2.0.4](https://github.com/contentstack/live-preview-sdk/compare/v2.0.3...v2.0.4)

> 19 September 2024

### New Features

- feat: added support for variant in CSLP tags (Mridul Sharma - [#235](https://github.com/contentstack/live-preview-sdk/pull/235))
- feat: added export of IStackSDK type for Typscript contentstack SDK (Mridul Sharma - [#233](https://github.com/contentstack/live-preview-sdk/pull/233))

### Fixes

- fix: live preview: added variant support in data cslp tag function (Mridul Sharma - [#211](https://github.com/contentstack/live-preview-sdk/pull/211))

### General Changes

- 1.4.4 release (Mridul Sharma - [#165](https://github.com/contentstack/live-preview-sdk/pull/165))

### New Features

- feat: added variant support in edit tags (Mridul Sharma - [dc7d564](https://github.com/contentstack/live-preview-sdk/commit/dc7d564d5583c3906db238b5245d958d88850dbb))

### Fixes

- fix: resolved window undefined issue (Mridul Sharma - [348103e](https://github.com/contentstack/live-preview-sdk/commit/348103e3ef517a4685c499bac507e5cdca73f2d1))

### Chores And Housekeeping

- chore: added integrity attribute to script tag in readme file (Mridul Sharma - [f229cd6](https://github.com/contentstack/live-preview-sdk/commit/f229cd65eee7f9114e6d7b4a820c296b0ec47d16))
- chore: removed console log (Mridul Sharma - [fc1b9fb](https://github.com/contentstack/live-preview-sdk/commit/fc1b9fbe06691641a997c6aefe77bb998b324290))
- chore: updated package version (Mridul Sharma - [2ab2f16](https://github.com/contentstack/live-preview-sdk/commit/2ab2f16ec4b9510f5feb33cc12def6afa2130844))
- chore: fixed package json post robot version (Mridul Sharma - [9ab2fd4](https://github.com/contentstack/live-preview-sdk/commit/9ab2fd4440dbfed6d18967516b133288eea77c79))

### Changes to Test Assests

- test: updated test for variant edit button tags (Mridul Sharma - [9bbda17](https://github.com/contentstack/live-preview-sdk/commit/9bbda178163e6ceb5c3fca642cbd2e24e0c93a14))

## [v2.0.3](https://github.com/contentstack/live-preview-sdk/compare/v2.0.2...v2.0.3)

> 22 July 2024

### New Features

- feat: add remove-diff listener to toggle highlight diff (Mridul Sharma - [#170](https://github.com/contentstack/live-preview-sdk/pull/170))

### Fixes

- fix: removed code for default branch (Mridul Sharma - [#162](https://github.com/contentstack/live-preview-sdk/pull/162))
- fix: removed code for default branch (Mridul Sharma - [#161](https://github.com/contentstack/live-preview-sdk/pull/161))

### General Changes

- 1.4.4 V2 release (Mridul Sharma - [#164](https://github.com/contentstack/live-preview-sdk/pull/164))
- v 1.4.3 (Mridul Sharma - [#137](https://github.com/contentstack/live-preview-sdk/pull/137))

### Chores And Housekeeping

- chore: update mustache readme (Kirtesh Suthar - [76c4078](https://github.com/contentstack/live-preview-sdk/commit/76c40781aa4a680d00d1293e4a9db2ca22e89d86))
- chore: uncomment mustache script (Kirtesh Suthar - [c042af1](https://github.com/contentstack/live-preview-sdk/commit/c042af191ab8bab88627ba8998a26eab548a75d0))
- chore: updated the readme for new initialization for HTML code (Mridul Sharma - [dc099d3](https://github.com/contentstack/live-preview-sdk/commit/dc099d3bfd278127b0531a48950745cf2fda6696))
- chore: bump version to 2.0.3 (Kirtesh Suthar - [b24ecc6](https://github.com/contentstack/live-preview-sdk/commit/b24ecc629ff50f84967fe541a8b69c700b1d600c))
- chore: uncomment mustache (Kirtesh Suthar - [cf39bf6](https://github.com/contentstack/live-preview-sdk/commit/cf39bf68d1237cdd502ca9b5172af6f1fb7452e6))
- chore: updated package version for v2 (Mridul Sharma - [953ac72](https://github.com/contentstack/live-preview-sdk/commit/953ac72afc4128af89c0df0c001ba30907922164))

### Changes to Test Assests

- test: fix the test cases (Mridul Sharma - [e8170fd](https://github.com/contentstack/live-preview-sdk/commit/e8170fd7fc498751df3e9b11e12e2db901298a91))

## [v2.0.2](https://github.com/contentstack/live-preview-sdk/compare/v2.0.1...v2.0.2)

> 25 June 2024

### Fixes

- fix: edit button was removed from document (Mridul Sharma - [#135](https://github.com/contentstack/live-preview-sdk/pull/135))
- fix: removed headers key from SDK init data (Mridul Sharma - [#132](https://github.com/contentstack/live-preview-sdk/pull/132))

### General Changes

- 1.4.3 release for v2 SDK (Mridul Sharma - [#145](https://github.com/contentstack/live-preview-sdk/pull/145))

### Fixes

- fix: removed headers key from SDK init data as it no longer supports in contentstack SDK (Mridul Sharma - [7c15b22](https://github.com/contentstack/live-preview-sdk/commit/7c15b229d9b2d1fca8b83fc87ee4a17f06dc04da))
- fix: edit button was removed from document because of nextjs router push and replace method (Mridul Sharma - [04c5da6](https://github.com/contentstack/live-preview-sdk/commit/04c5da6ec37d38cb8f50f3a71fc7a16eebca0673))
- fix: updated code version for v2 type version (Mridul Sharma - [923af60](https://github.com/contentstack/live-preview-sdk/commit/923af60d9575d0c69dd4bf650921e4aa7d1745ac))

### General Changes

- codeql-analysis.yml (Aravind Kumar - [f0fc3cb](https://github.com/contentstack/live-preview-sdk/commit/f0fc3cb67e8fd217f36376b7c2c541db9689b960))
- sast-scan.yml (Aravind Kumar - [5417eaa](https://github.com/contentstack/live-preview-sdk/commit/5417eaacd7a395c971343fc008e1fb8d0dcc84bd))
- jira.yml (Aravind Kumar - [3f7f87d](https://github.com/contentstack/live-preview-sdk/commit/3f7f87d633f9a556616b34e802d4a51377d19ae5))
- sca-scan.yml (Aravind Kumar - [f2ee8f2](https://github.com/contentstack/live-preview-sdk/commit/f2ee8f29d2fa4546390986e144a3b3f84cf37b92))

## [v2.0.1](https://github.com/contentstack/live-preview-sdk/compare/v2.0.0...v2.0.1)

> 18 June 2024

### Fixes

- fix: add version bump in package json (Kirtesh Suthar - [#142](https://github.com/contentstack/live-preview-sdk/pull/142))

### General Changes

- Update README.md (Kirtesh Suthar - [#141](https://github.com/contentstack/live-preview-sdk/pull/141))

### General Changes

- codeql-analysis.yml (Aravind Kumar - [301829d](https://github.com/contentstack/live-preview-sdk/commit/301829daccf707d27b8f967510d3c1df01d3a234))
- sast-scan.yml (Aravind Kumar - [71836b4](https://github.com/contentstack/live-preview-sdk/commit/71836b42b12e58b003ad907fe183e3a6a0235fad))
- jira.yml (Aravind Kumar - [fa25902](https://github.com/contentstack/live-preview-sdk/commit/fa259024d66afee1d9ecfa8af326034c22bab9ed))
- sca-scan.yml (Aravind Kumar - [d47fc72](https://github.com/contentstack/live-preview-sdk/commit/d47fc720b1a153e57f28f0389582ed87d408185c))

## [v2.0.0](https://github.com/contentstack/live-preview-sdk/compare/v1.4.5...v2.0.0)

> 18 June 2024

### General Changes

- Ve 1931: Unload support (Kirtesh Suthar - [#136](https://github.com/contentstack/live-preview-sdk/pull/136))

### Fixes

- fix: styles with goober (RavenColEvol - [e505f71](https://github.com/contentstack/live-preview-sdk/commit/e505f719a2c11271949703cd80bbbe1ec6411a5c))
- fix: test cases (RavenColEvol - [cf91a1b](https://github.com/contentstack/live-preview-sdk/commit/cf91a1b6edfbde3d8a1aa48f1b0863d9dd5323ea))
- fix: styles to new design (RavenColEvol - [6f41203](https://github.com/contentstack/live-preview-sdk/commit/6f41203730cedfedfcba8bb74dcbd4fd95ad137f))
- fix: custom element extends (RavenColEvol - [4d66f4c](https://github.com/contentstack/live-preview-sdk/commit/4d66f4c18685b649768c613556fef51f2c175f7e))
- fix: class names to cs-compare (RavenColEvol - [5e8deb1](https://github.com/contentstack/live-preview-sdk/commit/5e8deb1fee607d60dc1ad654d6a02183478ce189))
- fix: goober to be treeshaken (RavenColEvol - [93fe1da](https://github.com/contentstack/live-preview-sdk/commit/93fe1da619c4d3d9c43f61d6657f3dbc069cdb3e))
- fix: add conditional check to only register custom component once (RavenColEvol - [ec7c921](https://github.com/contentstack/live-preview-sdk/commit/ec7c9215e4650a12b6dbb1641cc5fab6a1612db1))
- fix: post robot test cases (RavenColEvol - [ce1a650](https://github.com/contentstack/live-preview-sdk/commit/ce1a650e1731d5644beb5fefaa14e49c2fab3f70))

### Chores And Housekeeping

- chore: bump version to 2.0.0 (RavenColEvol - [550512c](https://github.com/contentstack/live-preview-sdk/commit/550512cd66074040a5121de3b24522f33c58b56b))
- chore: test webpack prod json (RavenColEvol - [7bb0f33](https://github.com/contentstack/live-preview-sdk/commit/7bb0f33d77c07a0393d4f3292ecadddbf5ea71b9))

### General Changes

- remove: live editing css import (RavenColEvol - [cdf86e9](https://github.com/contentstack/live-preview-sdk/commit/cdf86e94abbfeac6c691c67a451291af85929b76))
- bump: package versions (RavenColEvol - [ee03b60](https://github.com/contentstack/live-preview-sdk/commit/ee03b60ffb63edc02fc49eb3c5bd1d2d3abcffe7))
- add: tsup (RavenColEvol - [0bac3cd](https://github.com/contentstack/live-preview-sdk/commit/0bac3cd7b12d954201b32295d02021ea63408d77))
- add: css in js support (RavenColEvol - [0599d7c](https://github.com/contentstack/live-preview-sdk/commit/0599d7c11a701719bab3b07efbf5d35e763eaaad))
- changed: cs-live-preview-hoc from class to obj (RavenColEvol - [db82309](https://github.com/contentstack/live-preview-sdk/commit/db82309c6c00e483a73e9d66b4d04975e15575d2))
- add: page compare util (RavenColEvol - [130d4a2](https://github.com/contentstack/live-preview-sdk/commit/130d4a2ee4abbee2f29f10f06d8cc9896df4f7fd))
- add: cs-compare custom component to reduce css conflict (RavenColEvol - [e76cc8e](https://github.com/contentstack/live-preview-sdk/commit/e76cc8ee4e21a03da9f5b18e0f36243c21876aa0))
- change: webpack config to esm (RavenColEvol - [f4a6c49](https://github.com/contentstack/live-preview-sdk/commit/f4a6c495fc73cfaab904c5e647106c526805305c))
- add: page travel with anchor to update with query params (RavenColEvol - [261f52d](https://github.com/contentstack/live-preview-sdk/commit/261f52d153c89759a2e3a3d7ef488eed9acb4a65))
- add: react script shake support (RavenColEvol - [19b355a](https://github.com/contentstack/live-preview-sdk/commit/19b355af5571c03550e071ff2ac98297d72dff6c))
- temp: skipping test for now (RavenColEvol - [70b01d0](https://github.com/contentstack/live-preview-sdk/commit/70b01d0a41fbd7983be23f7c420190663079a59b))

## [v1.4.5](https://github.com/contentstack/live-preview-sdk/compare/v1.4.4...v1.4.5)

> 19 September 2024

### New Features

- feat: live preview: added variant support in data cslp tag function (Kirtesh Suthar - [#234](https://github.com/contentstack/live-preview-sdk/pull/234))

### Fixes

- fix: live preview: added variant support in data cslp tag function (Mridul Sharma - [#205](https://github.com/contentstack/live-preview-sdk/pull/205))

### New Features

- feat: added variant support in edit tags (Mridul Sharma - [dc7d564](https://github.com/contentstack/live-preview-sdk/commit/dc7d564d5583c3906db238b5245d958d88850dbb))

### Chores And Housekeeping

- chore: added integrity attribute to script tag in readme file (Mridul Sharma - [abc5845](https://github.com/contentstack/live-preview-sdk/commit/abc58452b1be115c64d973f0577c6a37a7484b26))
- chore: remove logs (Kirtesh Suthar - [84c0fdf](https://github.com/contentstack/live-preview-sdk/commit/84c0fdf00db1cb58e1194b22ba921ca8732ced40))
- chore: updated package version (Mridul Sharma - [ed55469](https://github.com/contentstack/live-preview-sdk/commit/ed55469b1ef941d643b116d729477442b90ecd25))

### Changes to Test Assests

- test: updated test for variant edit button tags (Mridul Sharma - [9bbda17](https://github.com/contentstack/live-preview-sdk/commit/9bbda178163e6ceb5c3fca642cbd2e24e0c93a14))

## [v1.4.4](https://github.com/contentstack/live-preview-sdk/compare/v1.4.3...v1.4.4)

> 22 July 2024

### Fixes

- fix: removed code for default branch (Mridul Sharma - [#161](https://github.com/contentstack/live-preview-sdk/pull/161))

### General Changes

- 1.4.4 release (Mridul Sharma - [#165](https://github.com/contentstack/live-preview-sdk/pull/165))

### Changes to Test Assests

- test: fix the test cases (Mridul Sharma - [e8170fd](https://github.com/contentstack/live-preview-sdk/commit/e8170fd7fc498751df3e9b11e12e2db901298a91))

## [v1.4.3](https://github.com/contentstack/live-preview-sdk/compare/v1.4.2...v1.4.3)

> 25 June 2024

### Fixes

- fix: edit button was removed from document (Mridul Sharma - [#135](https://github.com/contentstack/live-preview-sdk/pull/135))
- fix: removed headers key from SDK init data (Mridul Sharma - [#132](https://github.com/contentstack/live-preview-sdk/pull/132))

### General Changes

- v 1.4.3 (Mridul Sharma - [#137](https://github.com/contentstack/live-preview-sdk/pull/137))

### Fixes

- fix: removed headers key from SDK init data as it no longer supports in contentstack SDK (Mridul Sharma - [7c15b22](https://github.com/contentstack/live-preview-sdk/commit/7c15b229d9b2d1fca8b83fc87ee4a17f06dc04da))
- fix: edit button was removed from document because of nextjs router push and replace method (Mridul Sharma - [04c5da6](https://github.com/contentstack/live-preview-sdk/commit/04c5da6ec37d38cb8f50f3a71fc7a16eebca0673))

## [v1.4.2](https://github.com/contentstack/live-preview-sdk/compare/v1.4.1...v1.4.2)

> 24 April 2024

### Fixes

- fix: added branch support for edit button generate url (Mridul Sharma - [#115](https://github.com/contentstack/live-preview-sdk/pull/115))

### General Changes

- Branch support for Edit button (Mridul Sharma - [#116](https://github.com/contentstack/live-preview-sdk/pull/116))

### Chores And Housekeeping

- chore: updated package json version (Mridul Sharma - [10cdaa2](https://github.com/contentstack/live-preview-sdk/commit/10cdaa289a29076ef94c00bc93b98dba659d7a14))

## [v1.4.1](https://github.com/contentstack/live-preview-sdk/compare/v1.4.0...v1.4.1)

> 27 February 2024

### Fixes

- fix: EB-(761) Live edit button doesn't go away on page navigation (Mridul Sharma - [#101](https://github.com/contentstack/live-preview-sdk/pull/101))
- fix: added sanitization on SSR input URL (Mridul Sharma - [#100](https://github.com/contentstack/live-preview-sdk/pull/100))
- fix: (EB-430) removed extra init call to sync the data of website (Mridul Sharma - [#76](https://github.com/contentstack/live-preview-sdk/pull/76))

### General Changes

- Removd extra init and auto hide feature for Edit button (Mridul Sharma - [#102](https://github.com/contentstack/live-preview-sdk/pull/102))
- Update license copyright year(s) (Deepak Kharah - [#85](https://github.com/contentstack/live-preview-sdk/pull/85))

### Fixes

- fix: removed unsused ssr code (Mridul Sharma - [e53f629](https://github.com/contentstack/live-preview-sdk/commit/e53f629583f80d9062ffb03cd63e34e4f5075883))
- fix: removed commented code from test file (Mridul Sharma - [e8e3715](https://github.com/contentstack/live-preview-sdk/commit/e8e37155ccd78608738813aaaf688c735075c1b3))

### Chores And Housekeeping

- chore: updated license year in README file (Mridul Sharma - [a93043f](https://github.com/contentstack/live-preview-sdk/commit/a93043f52649928e3e36b002d1effd0d1f638e5f))
- chore: updated license year in README file (Mridul Sharma - [0495e3f](https://github.com/contentstack/live-preview-sdk/commit/0495e3fb244c8f0a1c794f1caf96e1749ce0ada9))
- chore: increased the package version (Mridul Sharma - [e8b5f4a](https://github.com/contentstack/live-preview-sdk/commit/e8b5f4ae8b6fd6f498a04331c07601ebcf05aeb8))

### Documentation Changes

- docs(license): update copyright year(s) (github-actions - [3ccbac3](https://github.com/contentstack/live-preview-sdk/commit/3ccbac33dd9b74f5d6ac8827d68890efcb959b24))

## [v1.4.0](https://github.com/contentstack/live-preview-sdk/compare/v1.3.2...v1.4.0)

> 7 September 2023

### New Features

- feat: get hash from live preview SDK (Deepak Kharah - [#67](https://github.com/contentstack/live-preview-sdk/pull/67))
- feat: Get Hash from SDK (Deepak Kharah - [#56](https://github.com/contentstack/live-preview-sdk/pull/56))

### Chores And Housekeeping

- chore: update deps for node 18 (Deepak Kharah - [#68](https://github.com/contentstack/live-preview-sdk/pull/68))
- chore: auto update copyright date in LICENSE (Deepak Kharah - [#65](https://github.com/contentstack/live-preview-sdk/pull/65))
- chore: return hash from config params for ssr (Raj - [#64](https://github.com/contentstack/live-preview-sdk/pull/64))

### General Changes

- use url params as input instead of string (Raj - [#66](https://github.com/contentstack/live-preview-sdk/pull/66))

### New Features

- feat: live preivew hash is available in HOC (Deepak Kharah - [f1fc2c7](https://github.com/contentstack/live-preview-sdk/commit/f1fc2c71201f1f29689afbd7b2034f704c673825))
- feat: get hash from sdk (Deepak Kharah - [e5e3027](https://github.com/contentstack/live-preview-sdk/commit/e5e30273e83a5af7a99a448e08f2f31e613dd570))

### Chores And Housekeeping

- chore: add tests (Sairaj Chouhan - [a310928](https://github.com/contentstack/live-preview-sdk/commit/a310928fbbd9b1e5be6958d1b1498477f6c1c1a6))
- chore: add workflow to update copyright date (Deepak Kharah - [c5f8092](https://github.com/contentstack/live-preview-sdk/commit/c5f809204830c4c47b00d9164db33dc88099589d))
- chore: reutrn hash from config params for ssr (Sairaj Chouhan - [b41c82c](https://github.com/contentstack/live-preview-sdk/commit/b41c82c303d86c9a6e3eba54b615a22113443c8c))
- chore: update package version (Deepak Kharah - [231f8c6](https://github.com/contentstack/live-preview-sdk/commit/231f8c61de5b9232554cd3532fb96ae835f81ec9))

### Documentation Changes

- docs: add hash and setConfigFromParams to docs (Deepak Kharah - [112183a](https://github.com/contentstack/live-preview-sdk/commit/112183a0e2c2770e3cbdaf1e2e59f1b9ff89dfca))

### Changes to Test Assests

- test: check set and get hash (Deepak Kharah - [935a428](https://github.com/contentstack/live-preview-sdk/commit/935a4286bd65d9f1f5076c2c9b05bff76858ca35))
- test: fix failing tests (Sairaj Chouhan - [9c8fe23](https://github.com/contentstack/live-preview-sdk/commit/9c8fe23bffd7820f68e5398101d837c9d3bca89f))

### General Changes

- change input from string to url params (Sairaj Chouhan - [fe1e1f4](https://github.com/contentstack/live-preview-sdk/commit/fe1e1f4c37b6d6931716a85f1c57329f6a844f67))

## [v1.3.2](https://github.com/contentstack/live-preview-sdk/compare/v1.3.1...v1.3.2)

> 12 May 2023

### Chores And Housekeeping

- chore: automate the generation of top level readme file (contentstackMridul - [#50](https://github.com/contentstack/live-preview-sdk/pull/50))
- chore: generate top level readme file automatically (contentstackMridul - [#49](https://github.com/contentstack/live-preview-sdk/pull/49))

### Chores And Housekeeping

- chore: removed the github action file for readme file generation (Mridul Sharma - [c0e6e2d](https://github.com/contentstack/live-preview-sdk/commit/c0e6e2d9bab9c034063bc5b2b1855d20f723711a))

## [v1.3.1](https://github.com/contentstack/live-preview-sdk/compare/v1.3.0...v1.3.1)

> 11 May 2023

### New Features

- feat: Locale based live preview and edit button controls (contentstackMridul - [#48](https://github.com/contentstack/live-preview-sdk/pull/48))
- feat: updated readme file and added error message on edit button enab… (contentstackMridul - [#47](https://github.com/contentstack/live-preview-sdk/pull/47))
- feat: added one more key to edit button to enable or disable the query param (contentstackMridul - [#46](https://github.com/contentstack/live-preview-sdk/pull/46))
- feat: (CS-36521) Edit button positioning in Live Preview (contentstackMridul - [#45](https://github.com/contentstack/live-preview-sdk/pull/45))
- feat: (CS-35937) user can enable or disabled the cslp buttons outside live preview (contentstackMridul - [#44](https://github.com/contentstack/live-preview-sdk/pull/44))
- feat: (CS-36522) live preview edit button: locale and env based url (contentstackMridul - [#43](https://github.com/contentstack/live-preview-sdk/pull/43))

### Fixes

- fix: (CS-35938) Hide the Live preview edit tag by default (contentstackMridul - [#42](https://github.com/contentstack/live-preview-sdk/pull/42))

### New Features

- feat: added a diffrent approach to enable or disable the edit button (Mridul Sharma - [4e67667](https://github.com/contentstack/live-preview-sdk/commit/4e67667ea039e06bf4581935fac51953c87f0b23))
- feat: added one more key to edit button to enable or disable the query param to include button (Mridul Sharma - [7be33be](https://github.com/contentstack/live-preview-sdk/commit/7be33be1e18621455dc432cfffccb39cfa43d320))
- feat: (CS-35937) user can enable or disabled the cslp buttons outside the live preview panel (Mridul Sharma - [af3697a](https://github.com/contentstack/live-preview-sdk/commit/af3697aa694191bec3077f054a22abfffb29751c))
- feat: updated readme file and added error message on edit button enablement (Mridul Sharma - [67bf32f](https://github.com/contentstack/live-preview-sdk/commit/67bf32fdfe99106ade3a7c6616957a77c97fd537))
- feat: (CS-35937) added extra array check on edit button exclude key (Mridul Sharma - [fa82249](https://github.com/contentstack/live-preview-sdk/commit/fa822497d86cf3d235522ca96f488d795a05a509))
- feat: (CS-35937) renamed the keys of edit button exclude array (Mridul Sharma - [f325800](https://github.com/contentstack/live-preview-sdk/commit/f32580063482eb24d001d1fcfb98552f6aceb44a))

### Fixes

- fix: fixed the edit button center position (Mridul Sharma - [a187b0b](https://github.com/contentstack/live-preview-sdk/commit/a187b0b745a73e11c67865e3b11aba138362810b))

### Chores And Housekeeping

- chore: version sdk updated (Mridul Sharma - [5108d7e](https://github.com/contentstack/live-preview-sdk/commit/5108d7ed16c985efa328d39d929907722fe4b80d))

### Changes to Test Assests

- test: (CS-36521) Edit button positioning in Live Preview (Mridul Sharma - [19cb3c6](https://github.com/contentstack/live-preview-sdk/commit/19cb3c655cfa15659794273c57ce45e676e115ef))
- test: added test to check the error if no environment passed in stack details (Mridul Sharma - [db025be](https://github.com/contentstack/live-preview-sdk/commit/db025be6b715ff0d0211b09107c83b16592d122f))
- test: modification on tests accroding to enable or disable cslp outside live preview (Mridul Sharma - [989a653](https://github.com/contentstack/live-preview-sdk/commit/989a653a3e14cf215a5e2e90b7c91763876392c8))
- test: updated the edit button redirect page test case (Mridul Sharma - [1db8c48](https://github.com/contentstack/live-preview-sdk/commit/1db8c481512995a354461acab469139b8354428e))

### General Changes

- CODEOWNERS update (aravindbuilt - [89c7e34](https://github.com/contentstack/live-preview-sdk/commit/89c7e34e0037b4ce2103908de671df0a1d4984b0))

## [v1.3.0](https://github.com/contentstack/live-preview-sdk/compare/v1.2.1...v1.3.0)

> 5 April 2023

### New Features

- feat: Added support for live preview 2.0 (contentstackMridul - [#41](https://github.com/contentstack/live-preview-sdk/pull/41))
- feat: added support for live preview ssr 2.0 (contentstackMridul - [#40](https://github.com/contentstack/live-preview-sdk/pull/40))

### Fixes

- fix: (CS-32183) onEntryChange calling api 2 times (contentstackMridul - [#38](https://github.com/contentstack/live-preview-sdk/pull/38))

### General Changes

- Update LICENSE (Deepak Kharah - [#37](https://github.com/contentstack/live-preview-sdk/pull/37))

### Fixes

- fix: replaced the skipInitRun with skipInitRender for better understandability (Mridul Sharma - [c2e2d7b](https://github.com/contentstack/live-preview-sdk/commit/c2e2d7bdae4c40dd5683d264c0950cca0792ab79))

### Chores And Housekeeping

- chore: standardize code quality (Mridul Sharma - [bd75822](https://github.com/contentstack/live-preview-sdk/commit/bd758229c1944fdc8010b6ff5f606a9f82c4875c))
- chore: updated the readme doc for onLiveEdit method (Mridul Sharma - [15e5439](https://github.com/contentstack/live-preview-sdk/commit/15e54394aa1d8781b196e1a693980e906b433377))
- chore: updated the readme doc for onLiveEdit method (Mridul Sharma - [ec7d428](https://github.com/contentstack/live-preview-sdk/commit/ec7d428de8f14c85089eb4a79b26ef1edfce8ffc))

### Refactoring and Updates

- refactor: code cleanup on onLiveEdit function (Mridul Sharma - [f13585d](https://github.com/contentstack/live-preview-sdk/commit/f13585d56dce0966cb6a58a6e4451d4ae481cbcf))

### Changes to Test Assests

- test: onLiveEdit + new param of onEntryChange functions (Mridul Sharma - [539996b](https://github.com/contentstack/live-preview-sdk/commit/539996ba105ecdadfc4428c51eccc7848679934a))

### General Changes

- secrets-scan.yml (aravindbuilt - [7bcb8b7](https://github.com/contentstack/live-preview-sdk/commit/7bcb8b760dd65cc6a049edb1545657b1258c0af0))
- sast-scan.yml (aravindbuilt - [8939514](https://github.com/contentstack/live-preview-sdk/commit/893951455ba6fdf68e65b132ee8e3252d6720d53))
- codeql-analysis.yml (aravindbuilt - [54e31c0](https://github.com/contentstack/live-preview-sdk/commit/54e31c0ba7999ec8dd66793ef21bf5908facd83f))
- jira.yml (aravindbuilt - [0ed9945](https://github.com/contentstack/live-preview-sdk/commit/0ed9945b31545affd575165961701e0afe0a781f))
- jira.yml (aravindbuilt - [24a93c6](https://github.com/contentstack/live-preview-sdk/commit/24a93c6a094728383ccd050cfd8c88f1c566ccb9))
- sca-scan.yml (aravindbuilt - [edb7d2a](https://github.com/contentstack/live-preview-sdk/commit/edb7d2ad89874dd0cb2dcddc77784ffc0d7ad5b0))
- sca-scan.yml (aravindbuilt - [82a47a0](https://github.com/contentstack/live-preview-sdk/commit/82a47a0357099de16e0e87eb29c19c2b6d10b302))
- jira.yml (aravindbuilt - [1479f3f](https://github.com/contentstack/live-preview-sdk/commit/1479f3fbf7aab4c295a22c2bb555c46a64990dc7))
- jira.yml (aravindbuilt - [1ab869f](https://github.com/contentstack/live-preview-sdk/commit/1ab869f589c194604e206ff92f7c0c45bf4f1a03))
- secrets-scan.yml (aravindbuilt - [6747d03](https://github.com/contentstack/live-preview-sdk/commit/6747d0319a2c162f42c5e9e634f6b552ffdd83cd))
- sast-scan.yml (aravindbuilt - [395ac73](https://github.com/contentstack/live-preview-sdk/commit/395ac7300e04e9eb1e1b1a91870c76b1e21fe3fa))
- codeql-analysis.yml (aravindbuilt - [99b36c6](https://github.com/contentstack/live-preview-sdk/commit/99b36c66d243ff3200ad65423a741c86727fec53))

## [v1.2.1](https://github.com/contentstack/live-preview-sdk/compare/v1.2.0...v1.2.1)

> 15 September 2022

### Fixes

- fix: resolve types for typescript projects (Deepak Kharah - [#27](https://github.com/contentstack/live-preview-sdk/pull/27))

### General Changes

- v1.2.1 (Deepak Kharah - [#28](https://github.com/contentstack/live-preview-sdk/pull/28))

### Fixes

- fix(types): point types to correct folder (Deepak Kharah - [910f9cd](https://github.com/contentstack/live-preview-sdk/commit/910f9cd0f24212eb1c4b8c52df2d97e2caa0f557))

### Chores And Housekeeping

- chore: run test before push (Deepak Kharah - [7d806bd](https://github.com/contentstack/live-preview-sdk/commit/7d806bdd16e3e4c44be11a12ff1c5c99f035e497))
- chore(package): update package version (Deepak Kharah - [a5729ce](https://github.com/contentstack/live-preview-sdk/commit/a5729ce2fc85019f955ccd1fcd9251599b22e222))

### Changes to Test Assests

- test(HOC): HOC must return correct package version (Deepak Kharah - [c12cc9a](https://github.com/contentstack/live-preview-sdk/commit/c12cc9abc9504a86bbadac247d5ddb346ae6741f))

### General Changes

- Delete sca-monitor.yml (aravindbuilt - [261b9c3](https://github.com/contentstack/live-preview-sdk/commit/261b9c37ea517edd39a570612dd9be0a933e42d7))
- secrets-scan.yml (aravindbuilt - [a97e204](https://github.com/contentstack/live-preview-sdk/commit/a97e204646677c1bf0fd37250087a06f0b4397a1))
- sca-scan.yml (aravindbuilt - [40d5617](https://github.com/contentstack/live-preview-sdk/commit/40d5617e7f2e9a827b5fb9636e300e6b5c0768c1))
- sast-scan.yml (aravindbuilt - [d7d878e](https://github.com/contentstack/live-preview-sdk/commit/d7d878e98103bbcd50bec78863a84ad3ee59b098))
- codeql-analysis.yml (aravindbuilt - [e7f49f5](https://github.com/contentstack/live-preview-sdk/commit/e7f49f52e8b8f04e54cb74feea8a0b8e0ca26d1f))

## [v1.2.0](https://github.com/contentstack/live-preview-sdk/compare/v1.1.0...v1.2.0)

> 14 September 2022

### New Features

- feat: client side JS support for the SSR pages (Deepak Kharah - [#21](https://github.com/contentstack/live-preview-sdk/pull/21))
- feat: reference support (Deepak Kharah - [#20](https://github.com/contentstack/live-preview-sdk/pull/20))
- feat(main): live preview should be enable by default (Deepak Kharah - [#19](https://github.com/contentstack/live-preview-sdk/pull/19))
- feat: cookie support for an SSR fetch request (Deepak Kharah - [#18](https://github.com/contentstack/live-preview-sdk/pull/18))

### Documentation Changes

- docs: update doc for updated configuration (Deepak Kharah - [#22](https://github.com/contentstack/live-preview-sdk/pull/22))

### General Changes

- v 1.2.0 (Deepak Kharah - [#23](https://github.com/contentstack/live-preview-sdk/pull/23))
- Docs review updates (Deepak Kharah - [#24](https://github.com/contentstack/live-preview-sdk/pull/24))

### New Features

- feat: client JS in SSR (Deepak Kharah - [b03bab9](https://github.com/contentstack/live-preview-sdk/commit/b03bab9103cde61b3c5b868b353ce4f37fff9e8a))
- feat(update data): send entry_uid with hash and content_type_uid (Deepak Kharah - [dc1482e](https://github.com/contentstack/live-preview-sdk/commit/dc1482eca1b3b6e49d59ae359a387d3d493ed8b9))
- feat(main): get version for SDK (Deepak Kharah - [60b1e09](https://github.com/contentstack/live-preview-sdk/commit/60b1e09a791ba04868e29ceaca42af2c796ef035))
- feat(main): add cookies support (Deepak Kharah - [91af37c](https://github.com/contentstack/live-preview-sdk/commit/91af37c1a2a1578b6a7436a36fb5d6faed656eea))

### Fixes

- fix: gatsbyDataFormatter had additional .json() (Deepak Kharah - [1161033](https://github.com/contentstack/live-preview-sdk/commit/1161033da7f2eae60ae62d2478a2a6f54f4750b6))

### Chores And Housekeeping

- chore: add fetch mock for test (Deepak Kharah - [bfb15dd](https://github.com/contentstack/live-preview-sdk/commit/bfb15ddab8ecbb8e2036f516e76cfcf1d015cb9d))
- chore: update security policy (Deepak Kharah - [67b1098](https://github.com/contentstack/live-preview-sdk/commit/67b1098e2434c1ecd7054319e2de583ca2be5102))
- chore: update package version (Deepak Kharah - [cd6c63f](https://github.com/contentstack/live-preview-sdk/commit/cd6c63f7011d5a3ba3c6c88085f4dc8db7a398ad))
- chore: update gitignore for .DS_Store (Deepak Kharah - [992ed84](https://github.com/contentstack/live-preview-sdk/commit/992ed84fb181e647c884ad20264ecc03a301b3a5))

### Changes to Test Assests

- test: debug module and cslp tooltip (Deepak Kharah - [8c16e34](https://github.com/contentstack/live-preview-sdk/commit/8c16e3412fc1a7d7adc6258341f9818129151a29))
- test: updated test modules (Deepak Kharah - [5dd3e58](https://github.com/contentstack/live-preview-sdk/commit/5dd3e58a0dd1455a0e1cbb779027d6f55fc00a14))
- test: update test for client side scripts (Deepak Kharah - [4cb056b](https://github.com/contentstack/live-preview-sdk/commit/4cb056bca76a8aea00802977ce810564ee7a05c8))
- test(update data): support for entry UID (Deepak Kharah - [f572b70](https://github.com/contentstack/live-preview-sdk/commit/f572b70ddfab5e33128d659e6a1d8854b1d0462b))
- test(version): add getSdkVersion checks (Deepak Kharah - [02bf9e6](https://github.com/contentstack/live-preview-sdk/commit/02bf9e6abddf9386a1873d77c6ab813742c153d7))

### General Changes

- Create codeql-analysis.yml (contentstack-admin - [0cc24ec](https://github.com/contentstack/live-preview-sdk/commit/0cc24ecaa50abe19d1249671d9777f6edd3f7c9e))
- Add files via upload (contentstack-admin - [0da5d45](https://github.com/contentstack/live-preview-sdk/commit/0da5d451f668694ad93b39b45e46d45a54e52826))
- change from doc review (Deepak Kharah - [7fedbe5](https://github.com/contentstack/live-preview-sdk/commit/7fedbe5b718f0a521e618cb5803d32b35c4f562d))

## v1.1.0

> 11 April 2022

### Chores And Housekeeping

- chore: add release workflow (Deepak Kharah - [#16](https://github.com/contentstack/live-preview-sdk/pull/16))

### General Changes

- Hot fixes for v1.1.0 (Deepak Kharah - [#15](https://github.com/contentstack/live-preview-sdk/pull/15))
- Hotfixes and doc updates (Deepak Kharah - [#8](https://github.com/contentstack/live-preview-sdk/pull/8))
- Updated README.md (Deepak Kharah - [#7](https://github.com/contentstack/live-preview-sdk/pull/7))
- Docs updated & CSR fixes (Deepak Kharah - [#6](https://github.com/contentstack/live-preview-sdk/pull/6))

### Fixes

- fix(package): vulerability (Deepak Kharah - [202f188](https://github.com/contentstack/live-preview-sdk/commit/202f1881860dd1b5df345b7127aaeae04365cb23))
- fix: vulnerabilities (Deepak Kharah - [2d6a02b](https://github.com/contentstack/live-preview-sdk/commit/2d6a02b46c1d2fb9effbdcc6bc82f5f5a35ef514))
- fix(CSR): sdk does not update actual Stack object (Deepak Kharah - [d5071a5](https://github.com/contentstack/live-preview-sdk/commit/d5071a5bd251d84b2663b94640d3c4a50f570eec))
- fix: Stack API was required (Deepak Kharah - [28b8b59](https://github.com/contentstack/live-preview-sdk/commit/28b8b59468a72dd07acb3c57f2e8f5a02231422e))
- fix(configuration): enable was true by default (Deepak Kharah - [ba78dd8](https://github.com/contentstack/live-preview-sdk/commit/ba78dd8e1080ebc921c240123955a0ee5233abcc))
- fix(handle user config): improper import (Deepak Kharah - [fc189c1](https://github.com/contentstack/live-preview-sdk/commit/fc189c14b3bb14b35d80d8d45f45dad27695dc17))
- fix: live preview host was incorrectly set (Deepak Kharah - [07a91ca](https://github.com/contentstack/live-preview-sdk/commit/07a91ca176e23292e88195f6416893536046d79c))
- fix: vulnerability (Deepak Kharah - [371fe2f](https://github.com/contentstack/live-preview-sdk/commit/371fe2f0032b20eb50c6465f08455b538c0b212c))
- fix: SDK does not set ssr: false automatically (Deepak Kharah - [00f4f3e](https://github.com/contentstack/live-preview-sdk/commit/00f4f3e71abf772cf34d29dcc9c4e64f699b50eb))

### Chores And Housekeeping

- chore(release): update foken name (Deepak Kharah - [936bfb9](https://github.com/contentstack/live-preview-sdk/commit/936bfb9d1c1f0c939ff9b032184eebf2b6359c85))
- chore: trim unwanted '/' in host (Deepak Kharah - [b130be0](https://github.com/contentstack/live-preview-sdk/commit/b130be035eb0ec40a33e4c5ad7e66faab028e823))
- chore: update package version (Deepak Kharah - [d7a9035](https://github.com/contentstack/live-preview-sdk/commit/d7a903518f6f0ed614cea275b40c1931739679f3))

### Documentation Changes

- docs(sdk): doc now includes all methods (Deepak Kharah - [c38daa2](https://github.com/contentstack/live-preview-sdk/commit/c38daa20f0fa389a98ee0c5948c677e677908c07))
- docs: live preview added (Deepak Kharah - [72f3ef9](https://github.com/contentstack/live-preview-sdk/commit/72f3ef970858ce5a5f85ad2aa459d0ca5088a403))
- docs(entire scope): refactor doc (Deepak Kharah - [bf46d4b](https://github.com/contentstack/live-preview-sdk/commit/bf46d4b75289a26739372e2424f362fcb736d030))

### Refactoring and Updates

- refactor: eslint installed (Deepak Kharah - [49e0969](https://github.com/contentstack/live-preview-sdk/commit/49e0969540144a1dca9b21611fc5e261b6c00b87))
- refactor: move ContentstackLivePreview to new folder (Deepak Kharah - [0095c89](https://github.com/contentstack/live-preview-sdk/commit/0095c897b7ea717f5036639c7b8330c23c914a48))
- refactor: move logger to separate file (Deepak Kharah - [db253e2](https://github.com/contentstack/live-preview-sdk/commit/db253e2650a460b79380005fa6aa73c4ec84b875))
- refactor: renamed live preview ts (Deepak Kharah - [cb6d2dc](https://github.com/contentstack/live-preview-sdk/commit/cb6d2dc8a72555850257a776d62bb9a9643e9793))
- refactor: lint rules added (Deepak Kharah - [17df597](https://github.com/contentstack/live-preview-sdk/commit/17df59775d8cf7cc65ed094175c7ebb0999e5f01))
- refactor: typo in button (Deepak Kharah - [d16330e](https://github.com/contentstack/live-preview-sdk/commit/d16330e308e6cb56e878b077ef6575e4bdb1ef88))
- refactor: replace location.href with location.assign (Deepak Kharah - [ab11893](https://github.com/contentstack/live-preview-sdk/commit/ab1189386fb46b31a95f7af2c2564bcfde8e5a8c))
- refactor(readme): updated live preview version (Deepak Kharah - [b09995f](https://github.com/contentstack/live-preview-sdk/commit/b09995fa7d0eea535fe92fa2fc93fdcd968bd2b9))

### Changes to Test Assests

- test: added test cases (Deepak Kharah - [eddb9f3](https://github.com/contentstack/live-preview-sdk/commit/eddb9f33767cccedba5e78fdfd69e60fe0641e8d))
- test: live preview modules (Deepak Kharah - [ff61ee7](https://github.com/contentstack/live-preview-sdk/commit/ff61ee7af9c66dae2a2a6a0abfaa813b225b4080))
- test: deprecated text (Deepak Kharah - [1520116](https://github.com/contentstack/live-preview-sdk/commit/1520116deb8b7970a9e4a04f77650bba7355b34d))
- test: edit tag should move to new hovered element (Deepak Kharah - [c490108](https://github.com/contentstack/live-preview-sdk/commit/c4901081594febc6d9108f2a1f1b0f52ff39115a))
- test: add data-test-id for multi button (Deepak Kharah - [5ca3491](https://github.com/contentstack/live-preview-sdk/commit/5ca34915d53b7438cbcedf145e1a515e5e391217))

### General Changes

- fixed: npm audit (Deepak Kharah - [7f07ab1](https://github.com/contentstack/live-preview-sdk/commit/7f07ab13df589c5e5b1b50ae8822df1b2554e3d4))
- added(gatsby): support for gatsby data converter (Deepak Kharah - [ace7612](https://github.com/contentstack/live-preview-sdk/commit/ace76125b8b3e62f6ed26f8549f5c3bbe4d59619))
- Initial Commit (Deepak Kharah - [f816753](https://github.com/contentstack/live-preview-sdk/commit/f816753c373274856a8f34eeb3bfb6a9ecb50d4a))
- add: unsubscribe method for entryOnchange (Deepak Kharah - [94f1bfb](https://github.com/contentstack/live-preview-sdk/commit/94f1bfb263a35370d7f6b93c6af276c387bfe7d9))
- convert methods to classic function (Deepak Kharah - [663c6c5](https://github.com/contentstack/live-preview-sdk/commit/663c6c5e9a17ffaa6459310755bd14e35d4abcb9))
- fixed: this was empty (Deepak Kharah - [9e55931](https://github.com/contentstack/live-preview-sdk/commit/9e55931505361fabaf985036101b96eeaac33b01))
- throw error when api key is missing (Deepak Kharah - [b7e619c](https://github.com/contentstack/live-preview-sdk/commit/b7e619cf52809541224c4cb3661326e9460ba689))
- update(gatsby data): added find support (Deepak Kharah - [b3a3145](https://github.com/contentstack/live-preview-sdk/commit/b3a314565949adce4c9093e25a6cc3897d4f73d9))
- update(config): shouldReload to ssr (Deepak Kharah - [fb6c3a5](https://github.com/contentstack/live-preview-sdk/commit/fb6c3a542f6c84993ca7797a12b21650400c618f))
- updated(types): made init optional (Deepak Kharah - [d4b41d8](https://github.com/contentstack/live-preview-sdk/commit/d4b41d8f6c8725fa170adf2eee339ca7d2180a07))
- update(doc): new package name updated (Deepak Kharah - [b13a600](https://github.com/contentstack/live-preview-sdk/commit/b13a600b21b3ec0721493f4901f8c82a11c83778))
- add: console messages (Deepak Kharah - [c5f3fae](https://github.com/contentstack/live-preview-sdk/commit/c5f3fae981927665bd2e4def0cb138b47d8db4e7))
- add deprication warning when passing stack SDK (Deepak Kharah - [e308e78](https://github.com/contentstack/live-preview-sdk/commit/e308e78d4b80af4fc77550b14534a626dfe2380e))
- update(readme): updated doc (Deepak Kharah - [0f8adfb](https://github.com/contentstack/live-preview-sdk/commit/0f8adfb96fb20fa18521e25d59f6cddd25cfe281))
- fixed: browser have empty livepreview object (Deepak Kharah - [0c25418](https://github.com/contentstack/live-preview-sdk/commit/0c254184d6d469bffdbca35bc8d70aee5d00ad95))
- show warning when reinitializing (Deepak Kharah - [975a3d2](https://github.com/contentstack/live-preview-sdk/commit/975a3d273d596e622d09207a3097ee61aeb1721a))
- Create CODEOWNERS (nandeesh-gajula - [28cff58](https://github.com/contentstack/live-preview-sdk/commit/28cff580b8b5695d7860413aaaa58a73fb20b2d0))
