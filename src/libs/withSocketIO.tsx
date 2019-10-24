import React, {Component} from 'react';
import io from 'socket.io-client';

const ContextSocketIO = React.createContext({
    socket: undefined as SocketIOClient.Socket | undefined
});

export interface WithSocketIOProps {
    socket?: SocketIOClient.Socket | undefined
}

export const withSocketIO = <T extends {}> (Child: React.ComponentType<T>) => {
    return (props: T) => {
        return (
            <ContextSocketIO.Consumer>
                {
                    ({socket}) => {
                        return (
                            <Child socket={socket} {...props}/>
                        )
                    }
                }
            </ContextSocketIO.Consumer>
        )
    }
};


export class SocketIOProvider extends Component {

    state = {
        connected: false
    };

    socket?: SocketIOClient.Socket;

    componentDidMount(): void {
        this.socket = io('https://b1troom.ru', {
            path: '/websocket'
        });
        this.forceUpdate();
    }

    componentWillUnmount(): void {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    render () {
        return (
            <ContextSocketIO.Provider
                value={{
                    socket: this.socket
                }}
            >
                {
                    this.props.children
                }
            </ContextSocketIO.Provider>
        );
    }

}