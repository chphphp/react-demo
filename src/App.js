import React, {
	Component
} from 'react';
import './app.less'
import HelloWorld from './pages/HelloWorld'
import {
	BrowserRouter as Router,
	Route,
	Switch,
	Redirect,
	Link
} from 'react-router-dom'

class App extends Component {
	render() {
		return (
			<Router>
                <Route path={'/'} component={HelloWorld}/>
            </Router>
		)
	}
}
export default App