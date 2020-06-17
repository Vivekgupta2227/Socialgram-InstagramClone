import React from "react";
import {createEditor} from "slate";
import {Slate,Editable,withReact} from "slate-react";
import {useAddPostDialogStyles} from "../../styles";
import { Dialog, AppBar, Toolbar , Typography, Divider, TextField, InputAdornment,Button,Paper,Avatar } from "@material-ui/core";
import { UserContext } from "../../App";
import { ArrowBackIos,PinDrop} from "@material-ui/icons";
import serialize from "../../utils/serialize";
import handleImageUpload from "../../utils/handleImageUpload";
import { useMutation } from "@apollo/react-hooks";
import {CREATE_POST} from "../../graphql/mutations";

const initialValue = [
    {
        type:"paragraph",   
        children:[{text:""}]
    }
]

function AddPostDialog({media,handleClose}){
    const classes=useAddPostDialogStyles();
    const editor = React.useMemo(()=> withReact(createEditor()),[])
    const [value,setValue] = React.useState(initialValue)
    const {me,currentUserId} = React.useContext(UserContext);
    const [location,setLocation] = React.useState('')
    const [submitting,setSubmitting] = React.useState(false)
    const [createPost] = useMutation(CREATE_POST)

    async function handleSharePost(){
        setSubmitting(true)
        const url = await handleImageUpload(media)
        const variables = {
            userId:currentUserId,
            location,
            caption:serialize({children:value}),
            media:url
        }
        await createPost({variables})
        setSubmitting(false)
        window.location.reload();
    }

    return (
        <Dialog fullScreen open onClose={handleClose}>
            <AppBar className={classes.appBar}>
                <Toolbar className={classes.toolBar}>
                    <ArrowBackIos onClick={handleClose} />
                    <Typography align="center" variant="body1" className={classes.title}>
                    New Post
                </Typography>
                <Button color="primary" className={classes.share} disabled={submitting} onClick={handleSharePost}>
                    Share
                </Button>
                </Toolbar>
            </AppBar>
            <Divider/>
            <Paper>
                <Avatar src={me.profile_image} />
            </Paper>
            <Paper style={{display:"flex"}}>
            <Avatar src={me.profile_image} style={{
                    marginTop:"20px",
                    marginRight:"20px"
                }} />    
            <Slate editor={editor} value={value} onChange={newValue => setValue(newValue)}>
                <Editable className={classes.editor}
                    style={{
                        paddingTop:"10px"
                    }}
                    placeholder="Write your caption"
                />
                <Avatar src={URL.createObjectURL(media)}
                className={classes.avatarLarge}
                style={{
                    marginTop:"20px",
                    marginRight:"20px"
                }}
                variant="square" />
            </Slate>
            </Paper>
            <TextField 
            fullWidth
            placeholder="Location"
            InputProps={{
                classes:{
                    root:classes.root,
                    input:classes.input,
                    underline:classes.underline
                },
                startAdornment:(
                    <InputAdornment>
                        <PinDrop/>
                    </InputAdornment>
                )
            }}
            onChange={event=>setLocation(event.target.value)} />
        </Dialog>
    )
}
export default AddPostDialog