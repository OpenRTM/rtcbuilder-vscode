// Generated from IDL.g4 by ANTLR 4.8
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete listener for a parse tree produced by IDLParser.
function IDLListener() {
	antlr4.tree.ParseTreeListener.call(this);
	return this;
}

IDLListener.prototype = Object.create(antlr4.tree.ParseTreeListener.prototype);
IDLListener.prototype.constructor = IDLListener;

// Enter a parse tree produced by IDLParser#specification.
IDLListener.prototype.enterSpecification = function(ctx) {
};

// Exit a parse tree produced by IDLParser#specification.
IDLListener.prototype.exitSpecification = function(ctx) {
};


// Enter a parse tree produced by IDLParser#definition.
IDLListener.prototype.enterDefinition = function(ctx) {
};

// Exit a parse tree produced by IDLParser#definition.
IDLListener.prototype.exitDefinition = function(ctx) {
};


// Enter a parse tree produced by IDLParser#module.
IDLListener.prototype.enterModule = function(ctx) {
};

// Exit a parse tree produced by IDLParser#module.
IDLListener.prototype.exitModule = function(ctx) {
};


// Enter a parse tree produced by IDLParser#interface_or_forward_decl.
IDLListener.prototype.enterInterface_or_forward_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#interface_or_forward_decl.
IDLListener.prototype.exitInterface_or_forward_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#interface_decl.
IDLListener.prototype.enterInterface_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#interface_decl.
IDLListener.prototype.exitInterface_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#forward_decl.
IDLListener.prototype.enterForward_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#forward_decl.
IDLListener.prototype.exitForward_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#interface_header.
IDLListener.prototype.enterInterface_header = function(ctx) {
};

// Exit a parse tree produced by IDLParser#interface_header.
IDLListener.prototype.exitInterface_header = function(ctx) {
};


// Enter a parse tree produced by IDLParser#interface_body.
IDLListener.prototype.enterInterface_body = function(ctx) {
};

// Exit a parse tree produced by IDLParser#interface_body.
IDLListener.prototype.exitInterface_body = function(ctx) {
};


// Enter a parse tree produced by IDLParser#export_.
IDLListener.prototype.enterExport_ = function(ctx) {
};

// Exit a parse tree produced by IDLParser#export_.
IDLListener.prototype.exitExport_ = function(ctx) {
};


// Enter a parse tree produced by IDLParser#interface_inheritance_spec.
IDLListener.prototype.enterInterface_inheritance_spec = function(ctx) {
};

// Exit a parse tree produced by IDLParser#interface_inheritance_spec.
IDLListener.prototype.exitInterface_inheritance_spec = function(ctx) {
};


// Enter a parse tree produced by IDLParser#interface_name.
IDLListener.prototype.enterInterface_name = function(ctx) {
};

// Exit a parse tree produced by IDLParser#interface_name.
IDLListener.prototype.exitInterface_name = function(ctx) {
};


// Enter a parse tree produced by IDLParser#a_scoped_name.
IDLListener.prototype.enterA_scoped_name = function(ctx) {
};

// Exit a parse tree produced by IDLParser#a_scoped_name.
IDLListener.prototype.exitA_scoped_name = function(ctx) {
};


// Enter a parse tree produced by IDLParser#scoped_name.
IDLListener.prototype.enterScoped_name = function(ctx) {
};

// Exit a parse tree produced by IDLParser#scoped_name.
IDLListener.prototype.exitScoped_name = function(ctx) {
};


// Enter a parse tree produced by IDLParser#value.
IDLListener.prototype.enterValue = function(ctx) {
};

// Exit a parse tree produced by IDLParser#value.
IDLListener.prototype.exitValue = function(ctx) {
};


// Enter a parse tree produced by IDLParser#value_forward_decl.
IDLListener.prototype.enterValue_forward_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#value_forward_decl.
IDLListener.prototype.exitValue_forward_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#value_box_decl.
IDLListener.prototype.enterValue_box_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#value_box_decl.
IDLListener.prototype.exitValue_box_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#value_abs_decl.
IDLListener.prototype.enterValue_abs_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#value_abs_decl.
IDLListener.prototype.exitValue_abs_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#value_decl.
IDLListener.prototype.enterValue_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#value_decl.
IDLListener.prototype.exitValue_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#value_header.
IDLListener.prototype.enterValue_header = function(ctx) {
};

// Exit a parse tree produced by IDLParser#value_header.
IDLListener.prototype.exitValue_header = function(ctx) {
};


// Enter a parse tree produced by IDLParser#value_inheritance_spec.
IDLListener.prototype.enterValue_inheritance_spec = function(ctx) {
};

// Exit a parse tree produced by IDLParser#value_inheritance_spec.
IDLListener.prototype.exitValue_inheritance_spec = function(ctx) {
};


// Enter a parse tree produced by IDLParser#value_name.
IDLListener.prototype.enterValue_name = function(ctx) {
};

// Exit a parse tree produced by IDLParser#value_name.
IDLListener.prototype.exitValue_name = function(ctx) {
};


// Enter a parse tree produced by IDLParser#value_element.
IDLListener.prototype.enterValue_element = function(ctx) {
};

// Exit a parse tree produced by IDLParser#value_element.
IDLListener.prototype.exitValue_element = function(ctx) {
};


// Enter a parse tree produced by IDLParser#state_member.
IDLListener.prototype.enterState_member = function(ctx) {
};

// Exit a parse tree produced by IDLParser#state_member.
IDLListener.prototype.exitState_member = function(ctx) {
};


// Enter a parse tree produced by IDLParser#init_decl.
IDLListener.prototype.enterInit_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#init_decl.
IDLListener.prototype.exitInit_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#init_param_decls.
IDLListener.prototype.enterInit_param_decls = function(ctx) {
};

// Exit a parse tree produced by IDLParser#init_param_decls.
IDLListener.prototype.exitInit_param_decls = function(ctx) {
};


// Enter a parse tree produced by IDLParser#init_param_decl.
IDLListener.prototype.enterInit_param_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#init_param_decl.
IDLListener.prototype.exitInit_param_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#init_param_attribute.
IDLListener.prototype.enterInit_param_attribute = function(ctx) {
};

// Exit a parse tree produced by IDLParser#init_param_attribute.
IDLListener.prototype.exitInit_param_attribute = function(ctx) {
};


// Enter a parse tree produced by IDLParser#const_decl.
IDLListener.prototype.enterConst_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#const_decl.
IDLListener.prototype.exitConst_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#const_type.
IDLListener.prototype.enterConst_type = function(ctx) {
};

// Exit a parse tree produced by IDLParser#const_type.
IDLListener.prototype.exitConst_type = function(ctx) {
};


// Enter a parse tree produced by IDLParser#const_exp.
IDLListener.prototype.enterConst_exp = function(ctx) {
};

// Exit a parse tree produced by IDLParser#const_exp.
IDLListener.prototype.exitConst_exp = function(ctx) {
};


// Enter a parse tree produced by IDLParser#or_expr.
IDLListener.prototype.enterOr_expr = function(ctx) {
};

// Exit a parse tree produced by IDLParser#or_expr.
IDLListener.prototype.exitOr_expr = function(ctx) {
};


// Enter a parse tree produced by IDLParser#xor_expr.
IDLListener.prototype.enterXor_expr = function(ctx) {
};

// Exit a parse tree produced by IDLParser#xor_expr.
IDLListener.prototype.exitXor_expr = function(ctx) {
};


// Enter a parse tree produced by IDLParser#and_expr.
IDLListener.prototype.enterAnd_expr = function(ctx) {
};

// Exit a parse tree produced by IDLParser#and_expr.
IDLListener.prototype.exitAnd_expr = function(ctx) {
};


// Enter a parse tree produced by IDLParser#shift_expr.
IDLListener.prototype.enterShift_expr = function(ctx) {
};

// Exit a parse tree produced by IDLParser#shift_expr.
IDLListener.prototype.exitShift_expr = function(ctx) {
};


// Enter a parse tree produced by IDLParser#add_expr.
IDLListener.prototype.enterAdd_expr = function(ctx) {
};

// Exit a parse tree produced by IDLParser#add_expr.
IDLListener.prototype.exitAdd_expr = function(ctx) {
};


// Enter a parse tree produced by IDLParser#mult_expr.
IDLListener.prototype.enterMult_expr = function(ctx) {
};

// Exit a parse tree produced by IDLParser#mult_expr.
IDLListener.prototype.exitMult_expr = function(ctx) {
};


// Enter a parse tree produced by IDLParser#unary_expr.
IDLListener.prototype.enterUnary_expr = function(ctx) {
};

// Exit a parse tree produced by IDLParser#unary_expr.
IDLListener.prototype.exitUnary_expr = function(ctx) {
};


// Enter a parse tree produced by IDLParser#unary_operator.
IDLListener.prototype.enterUnary_operator = function(ctx) {
};

// Exit a parse tree produced by IDLParser#unary_operator.
IDLListener.prototype.exitUnary_operator = function(ctx) {
};


// Enter a parse tree produced by IDLParser#primary_expr.
IDLListener.prototype.enterPrimary_expr = function(ctx) {
};

// Exit a parse tree produced by IDLParser#primary_expr.
IDLListener.prototype.exitPrimary_expr = function(ctx) {
};


// Enter a parse tree produced by IDLParser#literal.
IDLListener.prototype.enterLiteral = function(ctx) {
};

// Exit a parse tree produced by IDLParser#literal.
IDLListener.prototype.exitLiteral = function(ctx) {
};


// Enter a parse tree produced by IDLParser#positive_int_const.
IDLListener.prototype.enterPositive_int_const = function(ctx) {
};

// Exit a parse tree produced by IDLParser#positive_int_const.
IDLListener.prototype.exitPositive_int_const = function(ctx) {
};


// Enter a parse tree produced by IDLParser#type_decl.
IDLListener.prototype.enterType_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#type_decl.
IDLListener.prototype.exitType_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#type_declarator.
IDLListener.prototype.enterType_declarator = function(ctx) {
};

// Exit a parse tree produced by IDLParser#type_declarator.
IDLListener.prototype.exitType_declarator = function(ctx) {
};


// Enter a parse tree produced by IDLParser#type_spec.
IDLListener.prototype.enterType_spec = function(ctx) {
};

// Exit a parse tree produced by IDLParser#type_spec.
IDLListener.prototype.exitType_spec = function(ctx) {
};


// Enter a parse tree produced by IDLParser#simple_type_spec.
IDLListener.prototype.enterSimple_type_spec = function(ctx) {
};

// Exit a parse tree produced by IDLParser#simple_type_spec.
IDLListener.prototype.exitSimple_type_spec = function(ctx) {
};


// Enter a parse tree produced by IDLParser#bitfield_type_spec.
IDLListener.prototype.enterBitfield_type_spec = function(ctx) {
};

// Exit a parse tree produced by IDLParser#bitfield_type_spec.
IDLListener.prototype.exitBitfield_type_spec = function(ctx) {
};


// Enter a parse tree produced by IDLParser#base_type_spec.
IDLListener.prototype.enterBase_type_spec = function(ctx) {
};

// Exit a parse tree produced by IDLParser#base_type_spec.
IDLListener.prototype.exitBase_type_spec = function(ctx) {
};


// Enter a parse tree produced by IDLParser#template_type_spec.
IDLListener.prototype.enterTemplate_type_spec = function(ctx) {
};

// Exit a parse tree produced by IDLParser#template_type_spec.
IDLListener.prototype.exitTemplate_type_spec = function(ctx) {
};


// Enter a parse tree produced by IDLParser#constr_type_spec.
IDLListener.prototype.enterConstr_type_spec = function(ctx) {
};

// Exit a parse tree produced by IDLParser#constr_type_spec.
IDLListener.prototype.exitConstr_type_spec = function(ctx) {
};


// Enter a parse tree produced by IDLParser#simple_declarators.
IDLListener.prototype.enterSimple_declarators = function(ctx) {
};

// Exit a parse tree produced by IDLParser#simple_declarators.
IDLListener.prototype.exitSimple_declarators = function(ctx) {
};


// Enter a parse tree produced by IDLParser#declarators.
IDLListener.prototype.enterDeclarators = function(ctx) {
};

// Exit a parse tree produced by IDLParser#declarators.
IDLListener.prototype.exitDeclarators = function(ctx) {
};


// Enter a parse tree produced by IDLParser#declarator.
IDLListener.prototype.enterDeclarator = function(ctx) {
};

// Exit a parse tree produced by IDLParser#declarator.
IDLListener.prototype.exitDeclarator = function(ctx) {
};


// Enter a parse tree produced by IDLParser#simple_declarator.
IDLListener.prototype.enterSimple_declarator = function(ctx) {
};

// Exit a parse tree produced by IDLParser#simple_declarator.
IDLListener.prototype.exitSimple_declarator = function(ctx) {
};


// Enter a parse tree produced by IDLParser#complex_declarator.
IDLListener.prototype.enterComplex_declarator = function(ctx) {
};

// Exit a parse tree produced by IDLParser#complex_declarator.
IDLListener.prototype.exitComplex_declarator = function(ctx) {
};


// Enter a parse tree produced by IDLParser#floating_pt_type.
IDLListener.prototype.enterFloating_pt_type = function(ctx) {
};

// Exit a parse tree produced by IDLParser#floating_pt_type.
IDLListener.prototype.exitFloating_pt_type = function(ctx) {
};


// Enter a parse tree produced by IDLParser#integer_type.
IDLListener.prototype.enterInteger_type = function(ctx) {
};

// Exit a parse tree produced by IDLParser#integer_type.
IDLListener.prototype.exitInteger_type = function(ctx) {
};


// Enter a parse tree produced by IDLParser#signed_int.
IDLListener.prototype.enterSigned_int = function(ctx) {
};

// Exit a parse tree produced by IDLParser#signed_int.
IDLListener.prototype.exitSigned_int = function(ctx) {
};


// Enter a parse tree produced by IDLParser#signed_tiny_int.
IDLListener.prototype.enterSigned_tiny_int = function(ctx) {
};

// Exit a parse tree produced by IDLParser#signed_tiny_int.
IDLListener.prototype.exitSigned_tiny_int = function(ctx) {
};


// Enter a parse tree produced by IDLParser#signed_short_int.
IDLListener.prototype.enterSigned_short_int = function(ctx) {
};

// Exit a parse tree produced by IDLParser#signed_short_int.
IDLListener.prototype.exitSigned_short_int = function(ctx) {
};


// Enter a parse tree produced by IDLParser#signed_long_int.
IDLListener.prototype.enterSigned_long_int = function(ctx) {
};

// Exit a parse tree produced by IDLParser#signed_long_int.
IDLListener.prototype.exitSigned_long_int = function(ctx) {
};


// Enter a parse tree produced by IDLParser#signed_longlong_int.
IDLListener.prototype.enterSigned_longlong_int = function(ctx) {
};

// Exit a parse tree produced by IDLParser#signed_longlong_int.
IDLListener.prototype.exitSigned_longlong_int = function(ctx) {
};


// Enter a parse tree produced by IDLParser#unsigned_int.
IDLListener.prototype.enterUnsigned_int = function(ctx) {
};

// Exit a parse tree produced by IDLParser#unsigned_int.
IDLListener.prototype.exitUnsigned_int = function(ctx) {
};


// Enter a parse tree produced by IDLParser#unsigned_tiny_int.
IDLListener.prototype.enterUnsigned_tiny_int = function(ctx) {
};

// Exit a parse tree produced by IDLParser#unsigned_tiny_int.
IDLListener.prototype.exitUnsigned_tiny_int = function(ctx) {
};


// Enter a parse tree produced by IDLParser#unsigned_short_int.
IDLListener.prototype.enterUnsigned_short_int = function(ctx) {
};

// Exit a parse tree produced by IDLParser#unsigned_short_int.
IDLListener.prototype.exitUnsigned_short_int = function(ctx) {
};


// Enter a parse tree produced by IDLParser#unsigned_long_int.
IDLListener.prototype.enterUnsigned_long_int = function(ctx) {
};

// Exit a parse tree produced by IDLParser#unsigned_long_int.
IDLListener.prototype.exitUnsigned_long_int = function(ctx) {
};


// Enter a parse tree produced by IDLParser#unsigned_longlong_int.
IDLListener.prototype.enterUnsigned_longlong_int = function(ctx) {
};

// Exit a parse tree produced by IDLParser#unsigned_longlong_int.
IDLListener.prototype.exitUnsigned_longlong_int = function(ctx) {
};


// Enter a parse tree produced by IDLParser#char_type.
IDLListener.prototype.enterChar_type = function(ctx) {
};

// Exit a parse tree produced by IDLParser#char_type.
IDLListener.prototype.exitChar_type = function(ctx) {
};


// Enter a parse tree produced by IDLParser#wide_char_type.
IDLListener.prototype.enterWide_char_type = function(ctx) {
};

// Exit a parse tree produced by IDLParser#wide_char_type.
IDLListener.prototype.exitWide_char_type = function(ctx) {
};


// Enter a parse tree produced by IDLParser#boolean_type.
IDLListener.prototype.enterBoolean_type = function(ctx) {
};

// Exit a parse tree produced by IDLParser#boolean_type.
IDLListener.prototype.exitBoolean_type = function(ctx) {
};


// Enter a parse tree produced by IDLParser#octet_type.
IDLListener.prototype.enterOctet_type = function(ctx) {
};

// Exit a parse tree produced by IDLParser#octet_type.
IDLListener.prototype.exitOctet_type = function(ctx) {
};


// Enter a parse tree produced by IDLParser#any_type.
IDLListener.prototype.enterAny_type = function(ctx) {
};

// Exit a parse tree produced by IDLParser#any_type.
IDLListener.prototype.exitAny_type = function(ctx) {
};


// Enter a parse tree produced by IDLParser#object_type.
IDLListener.prototype.enterObject_type = function(ctx) {
};

// Exit a parse tree produced by IDLParser#object_type.
IDLListener.prototype.exitObject_type = function(ctx) {
};


// Enter a parse tree produced by IDLParser#annotation_decl.
IDLListener.prototype.enterAnnotation_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#annotation_decl.
IDLListener.prototype.exitAnnotation_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#annotation_def.
IDLListener.prototype.enterAnnotation_def = function(ctx) {
};

// Exit a parse tree produced by IDLParser#annotation_def.
IDLListener.prototype.exitAnnotation_def = function(ctx) {
};


// Enter a parse tree produced by IDLParser#annotation_header.
IDLListener.prototype.enterAnnotation_header = function(ctx) {
};

// Exit a parse tree produced by IDLParser#annotation_header.
IDLListener.prototype.exitAnnotation_header = function(ctx) {
};


// Enter a parse tree produced by IDLParser#annotation_inheritance_spec.
IDLListener.prototype.enterAnnotation_inheritance_spec = function(ctx) {
};

// Exit a parse tree produced by IDLParser#annotation_inheritance_spec.
IDLListener.prototype.exitAnnotation_inheritance_spec = function(ctx) {
};


// Enter a parse tree produced by IDLParser#annotation_body.
IDLListener.prototype.enterAnnotation_body = function(ctx) {
};

// Exit a parse tree produced by IDLParser#annotation_body.
IDLListener.prototype.exitAnnotation_body = function(ctx) {
};


// Enter a parse tree produced by IDLParser#annotation_member.
IDLListener.prototype.enterAnnotation_member = function(ctx) {
};

// Exit a parse tree produced by IDLParser#annotation_member.
IDLListener.prototype.exitAnnotation_member = function(ctx) {
};


// Enter a parse tree produced by IDLParser#annotation_forward_dcl.
IDLListener.prototype.enterAnnotation_forward_dcl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#annotation_forward_dcl.
IDLListener.prototype.exitAnnotation_forward_dcl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#bitset_type.
IDLListener.prototype.enterBitset_type = function(ctx) {
};

// Exit a parse tree produced by IDLParser#bitset_type.
IDLListener.prototype.exitBitset_type = function(ctx) {
};


// Enter a parse tree produced by IDLParser#bitfield.
IDLListener.prototype.enterBitfield = function(ctx) {
};

// Exit a parse tree produced by IDLParser#bitfield.
IDLListener.prototype.exitBitfield = function(ctx) {
};


// Enter a parse tree produced by IDLParser#bitfield_spec.
IDLListener.prototype.enterBitfield_spec = function(ctx) {
};

// Exit a parse tree produced by IDLParser#bitfield_spec.
IDLListener.prototype.exitBitfield_spec = function(ctx) {
};


// Enter a parse tree produced by IDLParser#bitmask_type.
IDLListener.prototype.enterBitmask_type = function(ctx) {
};

// Exit a parse tree produced by IDLParser#bitmask_type.
IDLListener.prototype.exitBitmask_type = function(ctx) {
};


// Enter a parse tree produced by IDLParser#bit_values.
IDLListener.prototype.enterBit_values = function(ctx) {
};

// Exit a parse tree produced by IDLParser#bit_values.
IDLListener.prototype.exitBit_values = function(ctx) {
};


// Enter a parse tree produced by IDLParser#struct_type.
IDLListener.prototype.enterStruct_type = function(ctx) {
};

// Exit a parse tree produced by IDLParser#struct_type.
IDLListener.prototype.exitStruct_type = function(ctx) {
};


// Enter a parse tree produced by IDLParser#member_list.
IDLListener.prototype.enterMember_list = function(ctx) {
};

// Exit a parse tree produced by IDLParser#member_list.
IDLListener.prototype.exitMember_list = function(ctx) {
};


// Enter a parse tree produced by IDLParser#member.
IDLListener.prototype.enterMember = function(ctx) {
};

// Exit a parse tree produced by IDLParser#member.
IDLListener.prototype.exitMember = function(ctx) {
};


// Enter a parse tree produced by IDLParser#union_type.
IDLListener.prototype.enterUnion_type = function(ctx) {
};

// Exit a parse tree produced by IDLParser#union_type.
IDLListener.prototype.exitUnion_type = function(ctx) {
};


// Enter a parse tree produced by IDLParser#switch_type_spec.
IDLListener.prototype.enterSwitch_type_spec = function(ctx) {
};

// Exit a parse tree produced by IDLParser#switch_type_spec.
IDLListener.prototype.exitSwitch_type_spec = function(ctx) {
};


// Enter a parse tree produced by IDLParser#switch_body.
IDLListener.prototype.enterSwitch_body = function(ctx) {
};

// Exit a parse tree produced by IDLParser#switch_body.
IDLListener.prototype.exitSwitch_body = function(ctx) {
};


// Enter a parse tree produced by IDLParser#case_stmt.
IDLListener.prototype.enterCase_stmt = function(ctx) {
};

// Exit a parse tree produced by IDLParser#case_stmt.
IDLListener.prototype.exitCase_stmt = function(ctx) {
};


// Enter a parse tree produced by IDLParser#case_label.
IDLListener.prototype.enterCase_label = function(ctx) {
};

// Exit a parse tree produced by IDLParser#case_label.
IDLListener.prototype.exitCase_label = function(ctx) {
};


// Enter a parse tree produced by IDLParser#element_spec.
IDLListener.prototype.enterElement_spec = function(ctx) {
};

// Exit a parse tree produced by IDLParser#element_spec.
IDLListener.prototype.exitElement_spec = function(ctx) {
};


// Enter a parse tree produced by IDLParser#enum_type.
IDLListener.prototype.enterEnum_type = function(ctx) {
};

// Exit a parse tree produced by IDLParser#enum_type.
IDLListener.prototype.exitEnum_type = function(ctx) {
};


// Enter a parse tree produced by IDLParser#enumerator.
IDLListener.prototype.enterEnumerator = function(ctx) {
};

// Exit a parse tree produced by IDLParser#enumerator.
IDLListener.prototype.exitEnumerator = function(ctx) {
};


// Enter a parse tree produced by IDLParser#sequence_type.
IDLListener.prototype.enterSequence_type = function(ctx) {
};

// Exit a parse tree produced by IDLParser#sequence_type.
IDLListener.prototype.exitSequence_type = function(ctx) {
};


// Enter a parse tree produced by IDLParser#set_type.
IDLListener.prototype.enterSet_type = function(ctx) {
};

// Exit a parse tree produced by IDLParser#set_type.
IDLListener.prototype.exitSet_type = function(ctx) {
};


// Enter a parse tree produced by IDLParser#map_type.
IDLListener.prototype.enterMap_type = function(ctx) {
};

// Exit a parse tree produced by IDLParser#map_type.
IDLListener.prototype.exitMap_type = function(ctx) {
};


// Enter a parse tree produced by IDLParser#string_type.
IDLListener.prototype.enterString_type = function(ctx) {
};

// Exit a parse tree produced by IDLParser#string_type.
IDLListener.prototype.exitString_type = function(ctx) {
};


// Enter a parse tree produced by IDLParser#wide_string_type.
IDLListener.prototype.enterWide_string_type = function(ctx) {
};

// Exit a parse tree produced by IDLParser#wide_string_type.
IDLListener.prototype.exitWide_string_type = function(ctx) {
};


// Enter a parse tree produced by IDLParser#array_declarator.
IDLListener.prototype.enterArray_declarator = function(ctx) {
};

// Exit a parse tree produced by IDLParser#array_declarator.
IDLListener.prototype.exitArray_declarator = function(ctx) {
};


// Enter a parse tree produced by IDLParser#fixed_array_size.
IDLListener.prototype.enterFixed_array_size = function(ctx) {
};

// Exit a parse tree produced by IDLParser#fixed_array_size.
IDLListener.prototype.exitFixed_array_size = function(ctx) {
};


// Enter a parse tree produced by IDLParser#attr_decl.
IDLListener.prototype.enterAttr_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#attr_decl.
IDLListener.prototype.exitAttr_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#except_decl.
IDLListener.prototype.enterExcept_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#except_decl.
IDLListener.prototype.exitExcept_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#op_decl.
IDLListener.prototype.enterOp_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#op_decl.
IDLListener.prototype.exitOp_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#op_attribute.
IDLListener.prototype.enterOp_attribute = function(ctx) {
};

// Exit a parse tree produced by IDLParser#op_attribute.
IDLListener.prototype.exitOp_attribute = function(ctx) {
};


// Enter a parse tree produced by IDLParser#op_type_spec.
IDLListener.prototype.enterOp_type_spec = function(ctx) {
};

// Exit a parse tree produced by IDLParser#op_type_spec.
IDLListener.prototype.exitOp_type_spec = function(ctx) {
};


// Enter a parse tree produced by IDLParser#parameter_decls.
IDLListener.prototype.enterParameter_decls = function(ctx) {
};

// Exit a parse tree produced by IDLParser#parameter_decls.
IDLListener.prototype.exitParameter_decls = function(ctx) {
};


// Enter a parse tree produced by IDLParser#param_decl.
IDLListener.prototype.enterParam_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#param_decl.
IDLListener.prototype.exitParam_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#param_attribute.
IDLListener.prototype.enterParam_attribute = function(ctx) {
};

// Exit a parse tree produced by IDLParser#param_attribute.
IDLListener.prototype.exitParam_attribute = function(ctx) {
};


// Enter a parse tree produced by IDLParser#raises_expr.
IDLListener.prototype.enterRaises_expr = function(ctx) {
};

// Exit a parse tree produced by IDLParser#raises_expr.
IDLListener.prototype.exitRaises_expr = function(ctx) {
};


// Enter a parse tree produced by IDLParser#context_expr.
IDLListener.prototype.enterContext_expr = function(ctx) {
};

// Exit a parse tree produced by IDLParser#context_expr.
IDLListener.prototype.exitContext_expr = function(ctx) {
};


// Enter a parse tree produced by IDLParser#param_type_spec.
IDLListener.prototype.enterParam_type_spec = function(ctx) {
};

// Exit a parse tree produced by IDLParser#param_type_spec.
IDLListener.prototype.exitParam_type_spec = function(ctx) {
};


// Enter a parse tree produced by IDLParser#fixed_pt_type.
IDLListener.prototype.enterFixed_pt_type = function(ctx) {
};

// Exit a parse tree produced by IDLParser#fixed_pt_type.
IDLListener.prototype.exitFixed_pt_type = function(ctx) {
};


// Enter a parse tree produced by IDLParser#fixed_pt_const_type.
IDLListener.prototype.enterFixed_pt_const_type = function(ctx) {
};

// Exit a parse tree produced by IDLParser#fixed_pt_const_type.
IDLListener.prototype.exitFixed_pt_const_type = function(ctx) {
};


// Enter a parse tree produced by IDLParser#value_base_type.
IDLListener.prototype.enterValue_base_type = function(ctx) {
};

// Exit a parse tree produced by IDLParser#value_base_type.
IDLListener.prototype.exitValue_base_type = function(ctx) {
};


// Enter a parse tree produced by IDLParser#constr_forward_decl.
IDLListener.prototype.enterConstr_forward_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#constr_forward_decl.
IDLListener.prototype.exitConstr_forward_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#import_decl.
IDLListener.prototype.enterImport_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#import_decl.
IDLListener.prototype.exitImport_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#imported_scope.
IDLListener.prototype.enterImported_scope = function(ctx) {
};

// Exit a parse tree produced by IDLParser#imported_scope.
IDLListener.prototype.exitImported_scope = function(ctx) {
};


// Enter a parse tree produced by IDLParser#type_id_decl.
IDLListener.prototype.enterType_id_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#type_id_decl.
IDLListener.prototype.exitType_id_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#type_prefix_decl.
IDLListener.prototype.enterType_prefix_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#type_prefix_decl.
IDLListener.prototype.exitType_prefix_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#readonly_attr_spec.
IDLListener.prototype.enterReadonly_attr_spec = function(ctx) {
};

// Exit a parse tree produced by IDLParser#readonly_attr_spec.
IDLListener.prototype.exitReadonly_attr_spec = function(ctx) {
};


// Enter a parse tree produced by IDLParser#readonly_attr_declarator.
IDLListener.prototype.enterReadonly_attr_declarator = function(ctx) {
};

// Exit a parse tree produced by IDLParser#readonly_attr_declarator.
IDLListener.prototype.exitReadonly_attr_declarator = function(ctx) {
};


// Enter a parse tree produced by IDLParser#attr_spec.
IDLListener.prototype.enterAttr_spec = function(ctx) {
};

// Exit a parse tree produced by IDLParser#attr_spec.
IDLListener.prototype.exitAttr_spec = function(ctx) {
};


// Enter a parse tree produced by IDLParser#attr_declarator.
IDLListener.prototype.enterAttr_declarator = function(ctx) {
};

// Exit a parse tree produced by IDLParser#attr_declarator.
IDLListener.prototype.exitAttr_declarator = function(ctx) {
};


// Enter a parse tree produced by IDLParser#attr_raises_expr.
IDLListener.prototype.enterAttr_raises_expr = function(ctx) {
};

// Exit a parse tree produced by IDLParser#attr_raises_expr.
IDLListener.prototype.exitAttr_raises_expr = function(ctx) {
};


// Enter a parse tree produced by IDLParser#get_excep_expr.
IDLListener.prototype.enterGet_excep_expr = function(ctx) {
};

// Exit a parse tree produced by IDLParser#get_excep_expr.
IDLListener.prototype.exitGet_excep_expr = function(ctx) {
};


// Enter a parse tree produced by IDLParser#set_excep_expr.
IDLListener.prototype.enterSet_excep_expr = function(ctx) {
};

// Exit a parse tree produced by IDLParser#set_excep_expr.
IDLListener.prototype.exitSet_excep_expr = function(ctx) {
};


// Enter a parse tree produced by IDLParser#exception_list.
IDLListener.prototype.enterException_list = function(ctx) {
};

// Exit a parse tree produced by IDLParser#exception_list.
IDLListener.prototype.exitException_list = function(ctx) {
};


// Enter a parse tree produced by IDLParser#component.
IDLListener.prototype.enterComponent = function(ctx) {
};

// Exit a parse tree produced by IDLParser#component.
IDLListener.prototype.exitComponent = function(ctx) {
};


// Enter a parse tree produced by IDLParser#component_forward_decl.
IDLListener.prototype.enterComponent_forward_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#component_forward_decl.
IDLListener.prototype.exitComponent_forward_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#component_decl.
IDLListener.prototype.enterComponent_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#component_decl.
IDLListener.prototype.exitComponent_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#component_header.
IDLListener.prototype.enterComponent_header = function(ctx) {
};

// Exit a parse tree produced by IDLParser#component_header.
IDLListener.prototype.exitComponent_header = function(ctx) {
};


// Enter a parse tree produced by IDLParser#supported_interface_spec.
IDLListener.prototype.enterSupported_interface_spec = function(ctx) {
};

// Exit a parse tree produced by IDLParser#supported_interface_spec.
IDLListener.prototype.exitSupported_interface_spec = function(ctx) {
};


// Enter a parse tree produced by IDLParser#component_inheritance_spec.
IDLListener.prototype.enterComponent_inheritance_spec = function(ctx) {
};

// Exit a parse tree produced by IDLParser#component_inheritance_spec.
IDLListener.prototype.exitComponent_inheritance_spec = function(ctx) {
};


// Enter a parse tree produced by IDLParser#component_body.
IDLListener.prototype.enterComponent_body = function(ctx) {
};

// Exit a parse tree produced by IDLParser#component_body.
IDLListener.prototype.exitComponent_body = function(ctx) {
};


// Enter a parse tree produced by IDLParser#component_export.
IDLListener.prototype.enterComponent_export = function(ctx) {
};

// Exit a parse tree produced by IDLParser#component_export.
IDLListener.prototype.exitComponent_export = function(ctx) {
};


// Enter a parse tree produced by IDLParser#provides_decl.
IDLListener.prototype.enterProvides_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#provides_decl.
IDLListener.prototype.exitProvides_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#interface_type.
IDLListener.prototype.enterInterface_type = function(ctx) {
};

// Exit a parse tree produced by IDLParser#interface_type.
IDLListener.prototype.exitInterface_type = function(ctx) {
};


// Enter a parse tree produced by IDLParser#uses_decl.
IDLListener.prototype.enterUses_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#uses_decl.
IDLListener.prototype.exitUses_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#emits_decl.
IDLListener.prototype.enterEmits_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#emits_decl.
IDLListener.prototype.exitEmits_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#publishes_decl.
IDLListener.prototype.enterPublishes_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#publishes_decl.
IDLListener.prototype.exitPublishes_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#consumes_decl.
IDLListener.prototype.enterConsumes_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#consumes_decl.
IDLListener.prototype.exitConsumes_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#home_decl.
IDLListener.prototype.enterHome_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#home_decl.
IDLListener.prototype.exitHome_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#home_header.
IDLListener.prototype.enterHome_header = function(ctx) {
};

// Exit a parse tree produced by IDLParser#home_header.
IDLListener.prototype.exitHome_header = function(ctx) {
};


// Enter a parse tree produced by IDLParser#home_inheritance_spec.
IDLListener.prototype.enterHome_inheritance_spec = function(ctx) {
};

// Exit a parse tree produced by IDLParser#home_inheritance_spec.
IDLListener.prototype.exitHome_inheritance_spec = function(ctx) {
};


// Enter a parse tree produced by IDLParser#primary_key_spec.
IDLListener.prototype.enterPrimary_key_spec = function(ctx) {
};

// Exit a parse tree produced by IDLParser#primary_key_spec.
IDLListener.prototype.exitPrimary_key_spec = function(ctx) {
};


// Enter a parse tree produced by IDLParser#home_body.
IDLListener.prototype.enterHome_body = function(ctx) {
};

// Exit a parse tree produced by IDLParser#home_body.
IDLListener.prototype.exitHome_body = function(ctx) {
};


// Enter a parse tree produced by IDLParser#home_export.
IDLListener.prototype.enterHome_export = function(ctx) {
};

// Exit a parse tree produced by IDLParser#home_export.
IDLListener.prototype.exitHome_export = function(ctx) {
};


// Enter a parse tree produced by IDLParser#factory_decl.
IDLListener.prototype.enterFactory_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#factory_decl.
IDLListener.prototype.exitFactory_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#finder_decl.
IDLListener.prototype.enterFinder_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#finder_decl.
IDLListener.prototype.exitFinder_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#event.
IDLListener.prototype.enterEvent = function(ctx) {
};

// Exit a parse tree produced by IDLParser#event.
IDLListener.prototype.exitEvent = function(ctx) {
};


// Enter a parse tree produced by IDLParser#event_forward_decl.
IDLListener.prototype.enterEvent_forward_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#event_forward_decl.
IDLListener.prototype.exitEvent_forward_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#event_abs_decl.
IDLListener.prototype.enterEvent_abs_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#event_abs_decl.
IDLListener.prototype.exitEvent_abs_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#event_decl.
IDLListener.prototype.enterEvent_decl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#event_decl.
IDLListener.prototype.exitEvent_decl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#event_header.
IDLListener.prototype.enterEvent_header = function(ctx) {
};

// Exit a parse tree produced by IDLParser#event_header.
IDLListener.prototype.exitEvent_header = function(ctx) {
};


// Enter a parse tree produced by IDLParser#annapps.
IDLListener.prototype.enterAnnapps = function(ctx) {
};

// Exit a parse tree produced by IDLParser#annapps.
IDLListener.prototype.exitAnnapps = function(ctx) {
};


// Enter a parse tree produced by IDLParser#annotation_appl.
IDLListener.prototype.enterAnnotation_appl = function(ctx) {
};

// Exit a parse tree produced by IDLParser#annotation_appl.
IDLListener.prototype.exitAnnotation_appl = function(ctx) {
};


// Enter a parse tree produced by IDLParser#annotation_appl_params.
IDLListener.prototype.enterAnnotation_appl_params = function(ctx) {
};

// Exit a parse tree produced by IDLParser#annotation_appl_params.
IDLListener.prototype.exitAnnotation_appl_params = function(ctx) {
};


// Enter a parse tree produced by IDLParser#annotation_appl_param.
IDLListener.prototype.enterAnnotation_appl_param = function(ctx) {
};

// Exit a parse tree produced by IDLParser#annotation_appl_param.
IDLListener.prototype.exitAnnotation_appl_param = function(ctx) {
};


// Enter a parse tree produced by IDLParser#identifier.
IDLListener.prototype.enterIdentifier = function(ctx) {
};

// Exit a parse tree produced by IDLParser#identifier.
IDLListener.prototype.exitIdentifier = function(ctx) {
};


// Enter a parse tree produced by IDLParser#include_stmt.
IDLListener.prototype.enterInclude_stmt = function(ctx) {
};

// Exit a parse tree produced by IDLParser#include_stmt.
IDLListener.prototype.exitInclude_stmt = function(ctx) {
};



exports.IDLListener = IDLListener;