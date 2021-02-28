// dataframe entity

///////////////////////////////////////////
// constructors and getters
///////////////////////////////////////////
export function create() {
  return { "colnames": [], length: 0, isDataFrame: true, string_columns: {} }
}

export function add_column( df, name, values ) {
  df.colnames.push( name );
  df[name] = values;
  if (values.length > df.length) df.length = values.length;
  return df;
}

export function get_column_names( df ) {
  return df.colnames;
}

export function get_column( df, name ) {
  return df[name];
}

export function is_df( df ) {
  if (df && df.isDataFrame) return true;
  return false;
}

export function set_length( df, len ) {
  df.length = len;
}

export function get_length( df ) {
  return df.length;
}

export function set_column_type_string( df, name ) {
  df.string_columns[ name ] = true
}

export function is_string_column( df, name ) {
  return df.string_columns[ name ] ? true : false
}

///////////////////////////////////////////
// algos
///////////////////////////////////////////

export function create_from_hash( hash ) {
  var r = create();

  Object.keys(hash).forEach( function(name) {
      add_column( r, name, hash[name] );
  });
  
  return r;
}

export function update_length( df ) {
  var cn = get_column_names( df )[0];
  var col = get_column( df, cn );
  if (col) set_length( df, col.length );
  return df;
}

export function create_from_df( src ) {
  var r = create();

  get_column_names(src).forEach( function(name) {
      add_column( r, name, get_column(src,name).slice() );
  });

  return r;
}
