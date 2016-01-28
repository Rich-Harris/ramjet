import HtmlWrapper from './HtmlWrapper';

export default function wrapNode ( node, options ) {
	return new HtmlWrapper( node, options );
}
