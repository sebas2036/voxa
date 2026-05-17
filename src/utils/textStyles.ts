export type TextStyleType = 'normal' | 'bold' | 'italic' | 'caps' | 'mono' | 'strike' | 'wide'

export const STYLE_OPTIONS = [
  { key: 'normal', label: 'Aa', fw: '400', fi: 'normal', ls: 0 },
  { key: 'bold',   label: 'Aa', fw: '800', fi: 'normal', ls: 0 },
  { key: 'italic', label: 'Aa', fw: '400', fi: 'italic', ls: 0 },
  { key: 'caps',   label: 'AA', fw: '600', fi: 'normal', ls: 1 },
  { key: 'mono',   label: 'Aa', fw: '400', fi: 'normal', ls: 0, mono: true },
  { key: 'strike', label: 'Aa̶', fw: '400', fi: 'normal', ls: 0 },
  { key: 'wide',   label: 'A a', fw: '400', fi: 'normal', ls: 2 },
]

const BOLD: Record<string,string> = {'A':'𝐀','B':'𝐁','C':'𝐂','D':'𝐃','E':'𝐄','F':'𝐅','G':'𝐆','H':'𝐇','I':'𝐈','J':'𝐉','K':'𝐊','L':'𝐋','M':'𝐌','N':'𝐍','O':'𝐎','P':'𝐏','Q':'𝐐','R':'𝐑','S':'𝐒','T':'𝐓','U':'𝐔','V':'𝐕','W':'𝐖','X':'𝐗','Y':'𝐘','Z':'𝐙','a':'𝐚','b':'𝐛','c':'𝐜','d':'𝐝','e':'𝐞','f':'𝐟','g':'𝐠','h':'𝐡','i':'𝐢','j':'𝐣','k':'𝐤','l':'𝐥','m':'𝐦','n':'𝐧','o':'𝐨','p':'𝐩','q':'𝐪','r':'𝐫','s':'𝐬','t':'𝐭','u':'𝐮','v':'𝐯','w':'𝐰','x':'𝐱','y':'𝐲','z':'𝐳'}
const ITALIC: Record<string,string> = {'A':'𝘈','B':'𝘉','C':'𝘊','D':'𝘋','E':'𝘌','F':'𝘍','G':'𝘎','H':'𝘏','I':'𝘐','J':'𝘑','K':'𝘒','L':'𝘓','M':'𝘔','N':'𝘕','O':'𝘖','P':'𝘗','Q':'𝘘','R':'𝘙','S':'𝘚','T':'𝘛','U':'𝘜','V':'𝘝','W':'𝘞','X':'𝘟','Y':'𝘠','Z':'𝘡','a':'𝘢','b':'𝘣','c':'𝘤','d':'𝘥','e':'𝘦','f':'𝘧','g':'𝘨','h':'𝘩','i':'𝘪','j':'𝘫','k':'𝘬','l':'𝘭','m':'𝘮','n':'𝘯','o':'𝘰','p':'𝘱','q':'𝘲','r':'𝘳','s':'𝘴','t':'𝘵','u':'𝘶','v':'𝘷','w':'𝘸','x':'𝘹','y':'𝘺','z':'𝘻'}
const MONO: Record<string,string> = {'A':'𝙰','B':'𝙱','C':'𝙲','D':'𝙳','E':'𝙴','F':'𝙵','G':'𝙶','H':'𝙷','I':'𝙸','J':'𝙹','K':'𝙺','L':'𝙻','M':'𝙼','N':'𝙽','O':'𝙾','P':'𝙿','Q':'𝚀','R':'𝚁','S':'𝚂','T':'𝚃','U':'𝚄','V':'𝚅','W':'𝚆','X':'𝚇','Y':'𝚈','Z':'𝚉','a':'𝚊','b':'𝚋','c':'𝚌','d':'𝚍','e':'𝚎','f':'𝚏','g':'𝚐','h':'𝚑','i':'𝚒','j':'𝚓','k':'𝚔','l':'𝚕','m':'𝚖','n':'𝚗','o':'𝚘','p':'𝚙','q':'𝚚','r':'𝚛','s':'𝚜','t':'𝚝','u':'𝚞','v':'𝚟','w':'𝚠','x':'𝚡','y':'𝚢','z':'𝚣'}

export function applyTextStyle(text: string, style: string): string {
  switch(style) {
    case 'bold':   return text.split('').map(c => BOLD[c] || c).join('')
    case 'italic': return text.split('').map(c => ITALIC[c] || c).join('')
    case 'caps':   return text.toUpperCase()
    case 'mono':   return text.split('').map(c => MONO[c] || c).join('')
    case 'strike': return text.split('').map(c => c === ' ' ? ' ' : c + '\u0336').join('')
    case 'wide':   return text.split('').join(' ')
    default:       return text
  }
}
