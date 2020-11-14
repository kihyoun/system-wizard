
/**
 * General Configuration Object
 */
export default class Helper {
  public static get textLogo() {
    return `#-------------------------------------------------------------
#                +------------------+                        |
#               /|                 /|                        |
#              / |                / |                        |
#             *--+---------------*  |                        |
#             |  |               |  |                        |
#             |  |  System       |  |                        |
#             |  |  Bootstrapper |  |                        |
#             |  +---------------+--+                        |
#             | /                | /                         |
#             |/                 |/                          |
#             *------------------*                           |
#    +------+ https://www.system-bootstrapper.com
#$  /      /|                                                |
#  +------+ |                                                |
#  |      | +                                                |
#  |      |/                                                 |
#  +------+                                                  |
#-------------------------------------------------------------
`;
  }

  static unquote(value:string) {
    const trimmed = ('' + value).trim() || '';
    const newvalue = trimmed.substr(0,1) === '"' && trimmed.substr(-1,1) === '"'
      ? trimmed.substr( 1, trimmed.length - 2 )
      : trimmed;

    return newvalue;
  }

  static quote(value:any) {
    return `"${this.unquote(value)}"`;
  }
}