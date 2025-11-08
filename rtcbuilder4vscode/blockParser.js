class BlockParser {
  constructor(tagName, attributeName) {
    // より柔軟な正規表現
    const openTag = `<${tagName}\\s+${attributeName}\\s*=\\s*"(?<attr>[^"]+)"\\s*>`;
    const closeTag = `<\\/\\s*${tagName}\\s*>`;

    // 単行・複数行にかかわらず1つのパターンで処理
    this.blockPattern = new RegExp(
      `${openTag}(?<body>[\\s\\S]*?)${closeTag}`,
      "gi"
    );
  }

  parse(target) {
    const result = {};

    for (const match of target.matchAll(this.blockPattern)) {
      const { attr, body } = match.groups;
      result[attr] = body.trim(); // ← 空白除去で精度向上
    }

    return result;
  }

  merge(target, mergeMap, includeTag = false) {
    return target.replace(this.blockPattern, (match, ...args) => {
      const groups = args.pop();
      const attr = groups.attr;

      // mergeMap から取得、なければ元の body を使う
      const rawBody = mergeMap.hasOwnProperty(attr) ? mergeMap[attr] : groups.body;
      const safeBody = rawBody.replace(/\$/g, '$$$$'); // `$` エスケープ

      if (includeTag) {
        return `<rtc-template block="${attr}">${safeBody}</rtc-template>`;
      } else {
        return safeBody;
      }
    });
  }
}

module.exports = BlockParser;
