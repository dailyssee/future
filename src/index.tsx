import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {SocketIOProvider} from "./libs/withSocketIO";
import {Quotes} from "./libs/Quotes";

ReactDOM.render(
        <SocketIOProvider>
            <Quotes>
                <App/>
            </Quotes>
        </SocketIOProvider>
    , document.getElementById('root'));
