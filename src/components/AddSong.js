import React from "react";
import {TextField, InputAdornment, Button, Dialog, makeStyles} from "@material-ui/core";
import {Link, AddBoxOutlined} from '@material-ui/icons';
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import SoundcloudPlayer from 'react-player/lib/players/SoundCloud';
import YouTubePlayer from 'react-player/lib/players/YouTube';
import ReactPlayer from "react-player";
import {useMutation} from "@apollo/react-hooks";
import {ADD_SONG} from "../graphql/mutations";

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        alignItems: 'center'
    },
    urlInput: {
        margin: theme.spacing(1)
    },
    addSongButton: {
        margin: theme.spacing(1)
    },
    dialog: {
        textAlign: 'center'
    },
    thumbnail: {
        width: '90%'
    }
}));

const DEFAULT_SONG = {
    duration: 0,
    title: "",
    artist: "",
    thumbnail: "",
};

function AddSong() {
    const classes = useStyles();
    const [addSong, { error }] = useMutation(ADD_SONG);
    const [url, setUrl] = React.useState('');
    const [dialog, setDialog] = React.useState(false);
    const [playable, setPlayable] = React.useState(false);
    const [song, setSong] = React.useState(DEFAULT_SONG);

    React.useEffect(() => {
        const isPlayable = SoundcloudPlayer.canPlay(url) || YouTubePlayer.canPlay(url);
        setPlayable(isPlayable);
    }, [url]);

    function handleChangeSong(event) {
        const {name, value} = event.target
        setSong(prevSong => ({
            ...prevSong,
            [name]: value
        }));
    }

    function handleCloseDialog() {
        setDialog(false);
    }

    async function handleEditSong({player}) {
        const nestedPlayer = player.player.player
        let songData;

        if (nestedPlayer.getVideoData) {
            songData = getYoutubeInfo(nestedPlayer)
        } else if (nestedPlayer.getCurrentSound) {
            songData = await getSoundCloundInfo(nestedPlayer)
        }

        setSong({...songData, url});
    }

    async function handleAddSong() {
        try {
            const {url, thumbnail, duration, title, artist} = song;
            await addSong({
                variables: {
                    url: url.length > 0 ? url : null,
                    thumbnail: thumbnail.length > 0 ? thumbnail : null,
                    duration: duration > 0 ? duration : null,
                    title: title.length > 0 ? title : null,
                    artist: artist.length > 0 ? artist : null,
                }
            });
            handleCloseDialog();
            setSong(DEFAULT_SONG);
            setUrl("");
        } catch (error) {
            console.error("Error adding song", error)
        }

    }

    function getYoutubeInfo(player) {
        const duration = player.getDuration()
        const {title, video_id, author} = player.getVideoData();
        const thumbnail = `http://img.youtube.com/vi/${video_id}/0.jpg`;

        return {
            duration,
            title,
            artist: author,
            thumbnail
        }
    }

    function getSoundCloundInfo(player) {
        return new Promise(resolve => {
            player.getCurrentSound(songData => {
                if (songData) {
                    resolve({
                        duration: Number(songData.duration / 1000),
                        title: songData.title,
                        artist: songData.user.username,
                        thumbnail: songData.artwork_url.replace('-large', '-t500x500')
                    });
                }
            })
        })
    }

    function handleError(field) {
        return error?.graphQLErrors[0]?.extensions?.path?.includes(field);
    }

    const {thumbnail, title, artist} = song;

    return (
        <div className={classes.container}>
            <Dialog open={dialog} onClose={handleCloseDialog} className={classes.dialog}>
                <DialogTitle>Edit Song</DialogTitle>
                <DialogContent>
                    <img src={thumbnail}
                         alt="Song thumbnail" className={classes.thumbnail}/>
                    <TextField
                        margin="dense"
                        name="title"
                        label="Title"
                        value={title}
                        onChange={handleChangeSong}
                        error={handleError('title')}
                        helperText={handleError("title") && 'Fill out field'}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        name="artist"
                        label="Artist"
                        value={artist}
                        onChange={handleChangeSong}
                        error={handleError('artist')}
                        helperText={handleError("artist") && 'Fill out field'}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        name="thumbnail"
                        label="Thumbnail"
                        value={thumbnail}
                        onChange={handleChangeSong}
                        error={handleError('thumbnail')}
                        helperText={handleError("thumbnail") && 'Fill out field'}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button color="secondary" onClick={handleCloseDialog}>Cancel</Button>
                    <Button color="primary" variant="outlined" onClick={handleAddSong}>Add song</Button>
                </DialogActions>
            </Dialog>
            <TextField
                placeholder="Add Youtube or Soundcloud Url"
                fullWidth
                margin="normal"
                type="url"
                onChange={event => setUrl(event.target.value)}
                value={url}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Link/>
                        </InputAdornment>
                    )
                }}
                className={classes.urlInput}
            />
            <Button onClick={() => setDialog(true)}
                    variant="contained" color="primary" endIcon={<AddBoxOutlined/>}
                    className={classes.addSongButton}
                    disabled={!playable}
            >
                <ReactPlayer url={url} hidden onReady={handleEditSong}/>

            </Button>
        </div>
    );
}

export default AddSong;