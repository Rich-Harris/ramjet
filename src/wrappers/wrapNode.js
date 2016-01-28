import HtmlWrapper from './HtmlWrapper';
import { svgns } from '../utils/svg';

export default function wrapNode ( node, options ) {
	return node.namespaceURI === svgns ?
		//new SvgWrapper( node, options ) :
		new HtmlWrapper( node, options ) :
		new HtmlWrapper( node, options );
}
