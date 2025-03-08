import './App.css'
import { Link } from 'react-router-dom'

export default function Home() {
    return (
        <div style={{ padding: '50px', width: '100vw', display: 'flex', flexDirection: 'column', alignContent: 'center', justifyContent: 'center' }}>
            <p>Use the following links to redirect to the correct url:</p>
            <div>
                <Link to="/settings" className="btn btn-primary">Settings</Link>
            </div>
            <div>
                <Link to="/analytics" className="btn btn-primary">Analytics</Link>
            </div>


        </div>

    )
}