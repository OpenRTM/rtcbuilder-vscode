const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const antlr4 = require('antlr4');
const IDLLexer = require('./IDLLexer').IDLLexer;
const IDLParser = require('./IDLParser').IDLParser;
const IDLListener = require('./IDLListener').IDLListener;

const { IdlPathParam, DataTypeParam, ServiceClassParam } = require('../model/dataModels');

function parseServices(param) {
  let idlSearchPathList = [];
  let serviceList = [];
  let includeList = [];

  const defaultPath = process.env.RTM_ROOT;
  if(defaultPath != undefined) {
    const dispPath = path.join('<RTM_ROOT>', 'rtm', 'idl');
    const fullPath = path.join(defaultPath, 'rtm', 'idl');
    idlSearchPathList.push(new IdlPathParam({ path: fullPath, dispPath: dispPath, isDefault: true }));
  }

  const projectIdlPath = path.join(param, 'idl');
  idlSearchPathList.push(new IdlPathParam({ path: projectIdlPath, dispPath: 'idl', isDefault: false }));
  //
  const exclusionList = [
    'componentobserver.idl', 
    'dataport.idl', 
    'DataPort_OpenRTM.idl',
    'manager.idl',
    'openrtm.idl',
    'rtc.idl',
    'sdopackage.idl',
    'sharedmemory.idl'
  ];

  for (const eachPath of idlSearchPathList) {
    const fileList = getIdlFiles(eachPath.path);
    for(const eachFile of fileList) {
      const fileName = path.basename(eachFile);
      if(exclusionList.includes(fileName.toLowerCase())) continue;

      const retDef = praseIDL(eachFile);
      includeList.push(...retDef.includes);
      const interfaceDef = extractServiceNames(retDef);
      if(interfaceDef == null || interfaceDef.length == 0) continue;

      for(const each of interfaceDef) {
        let interfaceType =   new ServiceClassParam({
                                      name: each.name,
                                      idlFile: eachFile,
                                      idlPath: eachFile,
                                      idlDispFile: path.join(eachPath.dispPath, fileName) });
        interfaceType.module = each.module;
        interfaceType.methods = each.methods;
        interfaceType.includes = retDef.includes;
        interfaceType.superInterfaceList = each.superInterfaces;
        serviceList.push(interfaceType);
      }
    }
  }
  return { idlSearchPathList, serviceList, includeList }
}

function extractServiceNames(source, parentName = '') {
  const result = [];

  if(0 < source.interfaces.length) {
    for(const each of source.interfaces) {
      result.push({ name: each.name,
                    methods: each.methods,
                    superInterfaces: each.superInterfaces });
    }
  }

  source.modules.forEach(mod => {
    const currentModuleName = parentName ? `${parentName}::${mod.name}` : mod.name;
    if (mod.interfaces && Array.isArray(mod.interfaces)) {
      mod.interfaces.forEach(interface => {
        for(const m of interface.methods) {
          m.module = currentModuleName + '::';
          for(const p of m.params) {
            p.module = currentModuleName + '::';
          }
        }
        result.push({name: `${currentModuleName}::${interface.name}`,
                        module: currentModuleName,
                        methods: interface.methods,
                        superInterfaces: interface.superInterfaces });
      });
    }
    if (mod.modules && Array.isArray(mod.interfaces)) {
      const nested = extractServiceNames(mod.interfaces, currentModuleName);
      result.push(...nested);
    }
  });

  return result;
}

function getDataTypesDef(param) {
  let idlSearchPathList = [];
  let dateTypeList = [];

  const defaultPath = process.env.RTM_ROOT;
  if(defaultPath != undefined) {
    const dispPath = path.join('<RTM_ROOT>', 'rtm', 'idl');
    const fullPath = path.join(defaultPath, 'rtm', 'idl');
    idlSearchPathList.push(new IdlPathParam({ path: fullPath, dispPath: dispPath, isDefault: true }));
  }

  const projectIdlPath = path.join(param, 'idl');
  idlSearchPathList.push(new IdlPathParam({ path: projectIdlPath, dispPath: 'idl', isDefault: false }));
  //
  const exclusionList = [
    'componentobserver.idl', 
    'dataport.idl', 
    'DataPort_OpenRTM.idl',
    'manager.idl',
    'openrtm.idl',
    'rtc.idl',
    'sdopackage.idl',
    'sharedmemory.idl'
  ];

  for (const eachPath of idlSearchPathList) {
    const fileList = getIdlFiles(eachPath.path);
    for(const eachFile of fileList) {
      const fileName = path.basename(eachFile);
      if(exclusionList.includes(fileName.toLowerCase())) continue;

      const retDef = praseIDL(eachFile);
      const typeDef = extractStructTypes(retDef);
      dateTypeList.push(...typeDef);
    }
  }
  return { idlSearchPathList, dateTypeList }
}

function extractStructTypes(source, parentName = '') {
  const result = [];

  if(0 < source.structs.length) {
    for(const each of source.structs) {
      result.push(each);
    }
  }
  if(0 < source.typedefs.length) {
    for(const each of source.typedefs) {
      result.push(each);
    }
  }
  if(0 < source.enums.length) {
    for(const each of source.enums) {
      result.push(each);
    }
  }

  source.modules.forEach(mod => {
    const currentModuleName = parentName ? `${parentName}::${mod.name}` : mod.name;
    if (mod.structs && Array.isArray(mod.structs)) {
      mod.structs.forEach(struct => {
        struct.name = `${currentModuleName}::${struct.name}`;
        result.push(struct);
      });
    }
    if (mod.typedefs && Array.isArray(mod.typedefs)) {
      mod.typedefs.forEach(defs => {
        defs.name = `${currentModuleName}::${defs.name}`;
        result.push(defs);
      });
    }
    if (mod.enums && Array.isArray(mod.enums)) {
      mod.enums.forEach(elem => {
        elem.name = `${currentModuleName}::${elem.name}`;
        result.push(elem);
      });
    }
    if (mod.modules && Array.isArray(mod.modules)) {
      const nested = extractStructNames(mod.modules, currentModuleName);
      result.push(...nested);
    }
  });

  return result;
}

function parseDataTypes(param) {
  let idlSearchPathList = [];
  let dateTypeList = [];

  const defaultPath = process.env.RTM_ROOT;
  if(defaultPath != undefined) {
    const dispPath = path.join('<RTM_ROOT>', 'rtm', 'idl');
    const fullPath = path.join(defaultPath, 'rtm', 'idl');
    idlSearchPathList.push(new IdlPathParam({ path: fullPath, dispPath: dispPath, isDefault: true }));
  }

  const projectIdlPath = path.join(param, 'idl');
  idlSearchPathList.push(new IdlPathParam({ path: projectIdlPath, dispPath: 'idl', isDefault: false }));
  //
  const exclusionList = [
    'componentobserver.idl', 
    'dataport.idl', 
    'DataPort_OpenRTM.idl',
    'manager.idl',
    'openrtm.idl',
    'rtc.idl',
    'sdopackage.idl',
    'sharedmemory.idl'
  ];

  for (const eachPath of idlSearchPathList) {
    const fileList = getIdlFiles(eachPath.path);
    for(const eachFile of fileList) {
      const fileName = path.basename(eachFile);
      if(exclusionList.includes(fileName.toLowerCase())) continue;

      const retDef = praseIDL(eachFile);
      const typeDef = extractStructNames(retDef);
      if(typeDef == null || typeDef.length == 0) continue;

      let dataType =   new DataTypeParam({
                                fullPath: eachFile,
                                dispPath: path.join(eachPath.dispPath, fileName),
                                isDefault: eachPath.isDefault });
      dataType.definedTypes = typeDef;
      dateTypeList.push(dataType);
    }
  }
  return { idlSearchPathList, dateTypeList }
}

function extractStructNames(source, parentName = '') {
  const result = [];

  if(0 < source.structs.length) {
    for(const each of source.structs) {
      result.push(each.name);
    }
  }

  source.modules.forEach(mod => {
    const currentModuleName = parentName ? `${parentName}::${mod.name}` : mod.name;
    if (mod.structs && Array.isArray(mod.structs)) {
      mod.structs.forEach(struct => {
        result.push(`${currentModuleName}::${struct.name}`);
      });
    }
    if (mod.enums && Array.isArray(mod.enums)) {
      mod.enums.forEach(elem => {
        result.push(`${currentModuleName}::${elem.name}`);
      });
    }
    if (mod.modules && Array.isArray(mod.modules)) {
      const nested = extractStructNames(mod.modules, currentModuleName);
      result.push(...nested);
    }
  });

  return result;
}

function getIdlFiles(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    const idlFiles = files
      .filter(file => path.extname(file).toLowerCase() === '.idl')
      .map(file => path.join(dirPath, file));

    return idlFiles;
  } catch (err) {
    console.error('Failed to load the directory:', err);
    return [];
  }
}

function praseIDL(param) {
  const input = fs.readFileSync(param, 'utf-8');
  const inputNotComment = eraseComments(input);
  const inputNotPragma = erasePragma(inputNotComment);
  const inputNotProproc = erasePreprocessorDirectivesExceptInclude(inputNotPragma);

  const chars = new antlr4.InputStream(inputNotProproc);
  // const chars = new antlr4.InputStream(input);
  const lexer = new IDLLexer(chars);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new IDLParser(tokens);

  const tree = parser.specification();

  const listener = new IDLDefListener();
  antlr4.tree.ParseTreeWalker.DEFAULT.walk(listener, tree);

  const modules = listener.modules;
  const interfaces = listener.interfaces;
  const typedefs = listener.typedefs;
  const structs = listener.structs;
  const enums = listener.enums;
  const includes = listener.includes;

  return { modules, interfaces, typedefs, structs, enums, includes}
}

function eraseComments(target) {
  const COMMENT_PATTERN = /\/\*[\s\S]*?\*\/|\/\/.*$/gm;
  return target.replace(COMMENT_PATTERN, '');
}

function erasePragma(target) {
  const PRAGMA_PATTERN = /^\s*#pragma.*$/gm;
  return target.replace(PRAGMA_PATTERN, '');
}

function erasePreprocessorDirectivesExceptInclude(target) {
  const DIRECTIVE_PATTERN = /^\s*#(ifndef|define|ifdef|endif)\b.*$/gm;
  const ANGLE_INCLUDE_PATTERN = /^\s*#include\s*<.*?>.*$/gm;
  return target
    .replace(DIRECTIVE_PATTERN, '')
    .replace(ANGLE_INCLUDE_PATTERN, '');
  }

class IDLDefListener extends IDLListener {
  constructor() {
    super();
    this.modules = [];
    this.interfaces = [];
    this.structs = [];
    this.typedefs = [];
    this.includes = [];
    this.enums = [];
    this.currentModule = null;
    this.currentInterface = null;
  }

  // --- モジュール ---
  enterModule(ctx) {
    const moduleName = ctx.identifier().getText();
    const moduleInfo = {
      name: moduleName,
      interfaces: [],
      structs: [],
      typedefs: [],
      enums: []
    };
    this.modules.push(moduleInfo);
    this.currentModule = moduleInfo;
  }

  exitModule(ctx) {
    this.currentModule = null;
  }
  
  // --- インターフェース ---
  enterInterface_decl(ctx) {
    const interfaceName = ctx.interface_header().identifier().getText();
    const iface = {
      name: interfaceName,
      methods: [],
      superInterfaces: []
    };

    this.interfaces.superInterfaces = [];
    const inheritSpec = ctx.interface_header().interface_inheritance_spec();
    if (inheritSpec) {
      const names = inheritSpec.interface_name();
      iface.superInterfaces = names.map((iface) => iface.getText());
    }

    if (this.currentModule) {
      this.currentModule.interfaces.push(iface);
    } else {
      this.interfaces.push(iface);
    }

    this.currentInterface = iface;
  }

  exitInterface_decl(ctx) {
    this.currentInterface = null;
  }

// --- メソッド ---
  enterOp_decl(ctx) {
    if (!this.currentInterface) return;

    const methodName = ctx.identifier().getText();
    const type = ctx.op_type_spec().getText();

    const params = [];
    const paramDecls = ctx.parameter_decls()?.param_decl() || [];
    paramDecls.forEach(p => {
      params.push({
        direction: p.param_attribute().getText(),
        type: p.param_type_spec().getText(),
        name: p.simple_declarator().getText(),
        module: ''
      });
    });

    this.currentInterface.methods.push({
      name: methodName,
      module: '',
      type,
      params
    });
  }
  // --- typedef ---
  enterType_decl(ctx) {
    if (!ctx.KW_TYPEDEF) return;    

    const typeDecl = ctx.type_declarator(); 
    if (!typeDecl) return;
    const typeSpec = typeDecl.type_spec();
     if (!typeSpec) return;
    const typeText = typeSpec.getText();
    const declarators = typeDecl.declarators();

    declarators.children.forEach(decl => {
      if (!decl) return;
      let typedefName = decl.getText();
      let originalDef = '';
      let isArray = /\[\d*\]/.test(typedefName);
      let isSeq = /^sequence<[^>]+>$/.test(typeText);
      if(isArray) {
        const match = typedefName.match(/^([^\[]+)/);
        typedefName = match[1];
      } else if(isSeq) {
        const match = typeText.match(/^sequence<(.+)>$/);
        originalDef = match[1];
      }
      const tdef = {
        name: typedefName,
        type: typeText,
        originalDef: originalDef,
        isArray: isArray,
        isEnum: false,
        isSequence: isSeq,
        isStruct: false,
      };

      if (this.currentModule) {
        this.currentModule.typedefs.push(tdef);
      } else {
        this.typedefs.push(tdef);
      }
    });
  }
  // --- struct ---
  enterStruct_type(ctx) {
    const structName = ctx.identifier().getText();
    const members = [];

    const memberList = ctx.member_list();
    if (memberList && memberList.member) {
      const memberDecls = memberList.member();
      memberDecls.forEach(memberCtx => {
        const typeText = memberCtx.type_spec().getText();
        const declarators = memberCtx.declarators().declarator();

        declarators.forEach(decl => {
          const name = decl.getText();
          members.push({ type: typeText, name });
        });
      });
    }
    const structDef = {
      name: structName,
      isArray: false,
      isEnum: false,
      isSequence: false,
      isStruct: true,
      members
    };

    if (this.currentModule) {
      this.currentModule.structs.push(structDef);
    } else {
      this.structs.push(structDef);
    }
  }

  //Enum
  enterEnum_type(ctx) {
    const enumName = ctx.identifier().getText();
    const enumDef = {
      name: enumName,
      isArray: false,
      isEnum: true,
      isSequence: false,
      isStruct: false,
    };
    if (this.currentModule) {
      this.currentModule.enums.push(enumDef);
    } else {
      this.enums.push(enumDef);
    }
  }

  enterInclude_stmt(ctx) {
    const raw = ctx.STRING_LITERAL().getText();
    const includePath = raw.slice(1, -1);

    if (!this.includes) this.includes = [];
    this.includes.push(includePath);
  }
}

const INCLUDE_PATTERN = /^#include\s*(<|")(.+)(>|").*$/;
const INCLUDE_FILE_INDEX = 2;

function getIncludeFileContent(directive, includeBaseDirs, includeFilesOut = [], isCheck = false) {
    const match = directive.match(INCLUDE_PATTERN);
    if (!match) return null;

    const filePath = match[INCLUDE_FILE_INDEX];
    if (!includeBaseDirs || includeBaseDirs.length === 0) {
        throw new Error("Please specify the IDL directory in #include. " + filePath);
    }

    let fileFound = false;

    for (const baseDir of includeBaseDirs) {
        const fullPath = path.resolve(baseDir, filePath);
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            fileFound = true;

            if (!includeFilesOut.includes(fullPath)) {
                includeFilesOut.push(fullPath);
            }

            return content;
        }
    }

    if (isCheck && !fileFound) {
      if(isCheck) {
        throw new Error(filePath);
      } else {
        throw new Error("Header file not found: " + filePath);
      }
    }

    return null;
}

const PREPROCESSOR_PATTERN = /^#.*$/gm;

function parse(target, includeBaseDirs, includeFilesOut = [], isCheck = false) {
  const targetNoCmt = eraseComments(target);
  const targetNoPgm = erasePragma(targetNoCmt);

  return targetNoPgm.replace(PREPROCESSOR_PATTERN, (matchLine) => {
    const includeFileContent = getIncludeFileContentThoroughgoing(matchLine, includeBaseDirs, includeFilesOut, isCheck);
    return includeFileContent || '';
  });
}

function getIncludeFileContentThoroughgoing(directive, includeBaseDirs, includeFilesOut, isCheck) {
  const result = getIncludeFileContent(directive, includeBaseDirs, includeFilesOut, isCheck);
  if (result !== null && result !== undefined) {
    return parse(result, includeBaseDirs, includeFilesOut, isCheck);
  }
  return null;
}


module.exports = {
  parseDataTypes,
  parseServices,
  praseIDL,
  parse,
  getDataTypesDef
};
