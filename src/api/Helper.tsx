
/**
 * General Configuration Object
 */
export default class Helper {

  public static get textLogoBash() {
    return `#-------------------------------------------------------------
# This file was auto-generated using the system-bootstrapper |
` + this.textLogo;
  }

  public static get textLogo() {
    return `
#-------------------------------------------------------------
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
  public static get jsonLogo() {
    return `//-------------------------------------------------------------
// This file was auto-generated using the system-bootstrapper |
//-------------------------------------------------------------
//                +------------------+                        |
//               /|                 /|                        |
//              / |                / |                        |
//             *--+---------------*  |                        |
//             |  |               |  |                        |
//             |  |  System       |  |                        |
//             |  |  Bootstrapper |  |                        |
//             |  +---------------+--+                        |
//             | /                | /                         |
//             |/                 |/                          |
//             *------------------*                           |
//    +------+ https://www.system-bootstrapper.com
//$  /      /|                                                |
//  +------+ |                                                |
//  |      | +                                                |
//  |      |/                                                 |
//  +------+                                                  |
//-------------------------------------------------------------

`;
  }
}