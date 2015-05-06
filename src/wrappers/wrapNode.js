import HtmlWrapper from './HtmlWrapper';
import SvgWrapper from './SvgWrapper';
import { svgns } from '../utils/svg';

export default function wrapNode ( node ) {
	return node.namespaceURI === svgns ?
		new SvgWrapper( node ) :
		new HtmlWrapper( node );
}