import React from 'react';
import Header from "./components/Header";
import AddSong from "./components/AddSong";
import SongList from "./components/SongList";
import SongPlayer from "./components/SongPlayer";
import {Grid, useMediaQuery, Hidden} from "@material-ui/core";
import songReducer from "./reducer";

export const SongContext = React.createContext({
    song: {
        id: "0178c67b-928b-438f-9c2d-3e805e3da5fd",
        title: "Surf coffee",
        artist: "Propaganda machine",
        thumbnail: "https://www.mixcloud.com/PropagandaMachine/propaganda-machinetm-by-surf-coffee-021/",
        url: "https://www.mixcloud.com/PropagandaMachine/propaganda-machinetm-by-surf-coffee-021/",
        duration: 100
    },
    isPlaying: false
});

function App() {
    const initialSongState = React.useContext(SongContext);
    const [state, dispatch] = React.useReducer(songReducer, initialSongState);
    const greaterThanMd = useMediaQuery(theme => theme.breakpoints.up('md'));
    const greaterThanSm = useMediaQuery(theme => theme.breakpoints.up('sm'));

    return (
        <SongContext.Provider value={{state, dispatch}}>
            <Hidden only="xs">
                <Header/>
            </Hidden>
            <Grid container spacing={3}>
                <Grid item xs={12} md={7} style={{paddingTop: greaterThanSm ? 80 : 10}}>
                    <AddSong/>
                    <SongList/>
                </Grid>
                <Grid style={
                    greaterThanMd ?
                        {
                            position: "fixed",
                            width: '100%',
                            right: 0,
                            top: 70
                        } : {
                            position: 'fixed',
                            left: 0,
                            bottom: 0,
                            width: '100%'
                        }
                } item xs={12} md={5}>
                    <SongPlayer/>
                </Grid>
            </Grid>
        </SongContext.Provider>
    );
}

export default App;
