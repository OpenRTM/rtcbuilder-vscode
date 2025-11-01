# VS-Code版RtcBuilder
Visual Studio Code(VS-Code)で動作するOpenRTM-aist向けコンポーネント開発ツールです．
VS-Codeの拡張機能として提供されています．

### 構成
VS-Code版RtcBuilderの構成を示します．
- rtcbuilder4vscode
  - ツールの本体です。
コード生成に必要な基本機能と、C++版RTコンポーネントの雛形コードを生成する機能が含まれています。
- rtcbuilder4vscode-python
  - Python版RTコンポーネントの雛形コードを生成するための拡張機能です。
- rtcbuilder4vscode-java
  - Java版RTコンポーネントの雛形コードを生成するための拡張機能です。
- rtcbuilder4vscode-lua
  - Lua版RTコンポーネントの雛形コードを生成するための拡張機能です。
- rtcbuilder4vscode-processing
  - Processing版RTコンポーネントの雛形コードを生成するための拡張機能です。

### 開発環境構築方法
開発環境を構築したいディレクトリで，install-libs.bat もしくは install-libs.shを実行してください．

### 使用ライブラリ
- Nunjucks 3.2.4
  - <https://mozilla.github.io/nunjucks/>
  - JavaScript用テンプレートエンジン
- fast-xml-parser 5.2.5
  - <https://www.npmjs.com/package/fast-xml-parser>
  - XMLをJSONに変換するためのパーサー
- js2xmlparser 5.0.0
  - <https://www.npmjs.com/package/js2xmlparser/v/5.0.0>
  - JavaScriptオブジェクトを XML 形式の文字列に変換するための Node.js ライブラリ
- antlr4 4.8.0
  - <https://www.antlr.org/>
  - 構文解析器（パーサ）ジェネレーター.CORBAのIDLファイルのパーサーを生成するために使用
- monaco-editor 0.52.2
  - <https://microsoft.github.io/monaco-editor/>
  - 既存コード生成コードの差分(Diff)を表示するために使用
- iconv-lite 0.7.0
  - <https://www.npmjs.com/package/iconv-lite>
  - 文字コード変換ライブラリ

### LICENSE
The RTCBuilder-vscode software is **dual-licensed**.  
You may use, copy, distribute, and/or modify this software under one of the following two licenses:

1. **Apache License, Version 2.0**  
   See the file `LICENSE.txt` for the full text.

2. **Individual (Commercial) License**  
   You may obtain a commercial license from AIST and/or its Technology Licensing Organization (TLO)  
   that permits use, copying, modification, distribution, and/or sublicensing of this software  
   without the limitations or conditions of the Apache License, Version 2.0.  
   Such license shall be concluded through a negotiated agreement between you and AIST and/or its TLO.  
   To inquire about an individual license, please contact AIST using the information below.

### CONTACT INFORMATION
Noriaki Ando <n-ando@aist.go.jp>  
National Institute of Advanced Industrial Science and Technology (AIST)  
Intelligent Systems Research Institute (ISRI)  
Tsukuba Central 2, 1-1-1 Umezono, Tsukuba, Ibaraki 305-8568, Japan  
Tel: +81-80-2216-5009
