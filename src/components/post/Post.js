import React from "react";
import { usePostStyles } from "../../styles";
import UserCard from "../shared/UserCard";
import {MoreIcon ,CommentIcon, ShareIcon,LikeIcon,UnlikeIcon, RemoveIcon, SaveIcon} from "../../icons";
import {Link} from "react-router-dom";
import { Typography,Button, Divider ,TextField,Avatar} from "@material-ui/core";
import OptionsDialog from "../shared/OptionsDialog"; 
import PostSkeleton from "./PostSkeleton";
import { useSubscription,useMutation } from "@apollo/react-hooks";
import { GET_POST } from "../../graphql/subscriptions";
import {LIKE_POST,UNLIKE_POST,SAVE_POST,UNSAVE_POST,CREATE_COMMENT} from "../../graphql/mutations";
import {UserContext} from "../../App"; 
import { formatDateToNowShort, formatPostDate } from "../../utils/formatDate";
import Img from "react-graceful-image"

function Post({postId}) {
  const classes=usePostStyles();
  // const [loading,setLoading] = React.useState(true)
  const [showOptionsDialog,setOptionsDialog]=React.useState(false);
  const variables = {postId}
  const {data,loading} = useSubscription(GET_POST , {variables})
  

  // setTimeout(()=>setLoading(false),2000)  
  if(loading) return <PostSkeleton/>
  const {id,media,likes,user,caption,comments,created_at,likes_aggregate,saved_posts,location} = data.posts_by_pk;
  const likesCount = likes_aggregate.aggregate.count;
  

  return (
    <div className={classes.postContainer}>
    <article className={classes.article}>
      {/* Post Header */}
      <div className={classes.postHeader}>
        <UserCard user={user} location={location} avatarSize={32} />
        <MoreIcon
          className={classes.moreIcon}
          onClick={() => setOptionsDialog(true)}
        />
      </div>
      {/* Post Image */}
      <div className={classes.postImage}>
        <Img src={media} alt="Post media" className={classes.image} />
      </div>
      {/* Post Buttons */}
      <div className={classes.postButtonsWrapper}>
        <div className={classes.postButtons}>
          <LikeButton likes={likes} postId={id} authorId={user.id} />
          <Link to={`/p/${id}`}>
            <CommentIcon />
          </Link>
          <ShareIcon />
          <SaveButton savedPosts={saved_posts} postId={id} />
        </div>
        <Typography className={classes.likes} variant="subtitle2">
          <span>{likesCount === 1 ? "1 like" : `${likesCount} likes`}</span>
        </Typography>
        <div
          style={{
            overflowY: "none",
            padding: "16px 12px",
            height: "100%",
          }}
        >
          <AuthorCaption
            user={user}
            createdAt={created_at}
            caption={caption}
          />
          {comments.map((comment) => (
            <UserComment key={comment.id} comment={comment} />
          ))}
        </div>
        <Typography color="textSecondary" className={classes.datePosted}>
          {formatPostDate(created_at)}
        </Typography>
          <div className={classes.comment}>
            <Divider />
            <Comment postId={id} />
          </div>
      </div>
    </article>
    {showOptionsDialog && (
      <OptionsDialog onClose={() => setOptionsDialog(false)} postId={id} authorId={user.id}/>
    )}
  </div>
);
}

function AuthorCaption({ user, caption, createdAt }) {
const classes = usePostStyles();

return (
  <div style={{ display: "flex" }}>
    {/* <Avatar
      src={user.profile_image}
      alt="User avatar"
      style={{ marginRight: 14, width: 32, height: 32 }}
    /> */}
    <div style={{ display: "flex", flexDirection: "column " }}>
      <Link to={user.username}>
        <Typography
          variant="subtitle2"
          component="span"
          className={classes.username}
        >
          {user.username}
        </Typography>
        <Typography
          variant="body2"
          component="span"
          className={classes.postCaption}
          style={{ paddingLeft: 0 }}
          dangerouslySetInnerHTML={{ __html: caption }}
        />
      </Link>
      <Typography
        style={{ marginTop: 7, marginBottom: 4, display: "inline-block" }}
        color="textSecondary"
        variant="caption"
      >
        {formatDateToNowShort(createdAt)}
      </Typography>
    </div>
  </div>
);
}

function UserComment({comment}){
  const classes = usePostStyles()
  return(
  <div style={{display:"flex"}}>
      <Avatar src={comment.user.profile_image}
      alt="User_Avatar"
      styles={{
        marginLeft:14,
        marginRight:20,
        width:20,
        height:20
      }} />
      <div style={{display:"flex",flexDirection:"column",marginLeft:14}}>
        <Link to={comment.user.username}>
          <Typography variant="subtitle2"
          component="span"
          className={classes.username}>
            {comment.user.username}
          </Typography>
          <Typography
          variant="body2"
          component="span"
          className={classes.postCaption}
          style={{
            paddingLeft:0
          }}
          >
            {comment.content}
          </Typography>  
        </Link>
        <Typography
        style={{marginTop:4,marginBottom:4,display:'inline-block'}}
        color="textSecondary"
        variant="caption" >
          {formatDateToNowShort(comment.created_at)}
        </Typography>
      </div>
    </div>
  )
}

function LikeButton({likes,authorId,postId}){
  const classes = usePostStyles();
  const {currentUserId}=React.useContext(UserContext)
  const isAlreadyLiked = likes.some(({user_id})=>user_id===currentUserId)
  const [liked,setLiked] = React.useState(isAlreadyLiked);
  const Icon = liked ? UnlikeIcon :LikeIcon;
  const className = liked ? classes.liked:classes.like;
  const onClick = liked ? handleUnlike : handleLike;
  const [likePost]=useMutation(LIKE_POST);
  const [unlikePost] = useMutation(UNLIKE_POST);
  const variables={
    postId,
    userId:currentUserId,
    profileId:authorId
  }

  function handleLike(){
    // console.log('Like');
    setLiked(true);
    likePost({variables});
  }

  function handleUnlike(){
    // console.log('unLike');
    setLiked(false);
    unlikePost({variables});
  }
  return <Icon className={className} onClick={onClick}/>
}

function SaveButton({postId,savedPosts}){
  const classes = usePostStyles();
  const {currentUserId} =React.useContext(UserContext);
  const isAlreadySaved = savedPosts.some(({user_id})=>user_id===currentUserId)
  const [saved,setSaved] = React.useState(isAlreadySaved);
  const Icon = saved ? RemoveIcon :SaveIcon;
  const onClick = saved ? handleRemove : handleSave;
  const [savePost]=useMutation(SAVE_POST)
  const [unsavePost]=useMutation(UNSAVE_POST)
  const variables={
    postId,
    userId:currentUserId,
    // profileId:authorId
  }

  function handleSave(){
    // console.log('Saved');
    setSaved(true);
    savePost({variables});
  }

  function handleRemove(){
    // console.log('Removed');
    setSaved(false);
    unsavePost({variables});
  }
  return <Icon className={classes.saveIcon} onClick={onClick}/>
}

function Comment({postId}){
  const classes = usePostStyles();
  const [content,setContent]=React.useState('');
  const {currentUserId} = React.useContext(UserContext)
  const [createComment] = useMutation(CREATE_COMMENT)

  function handleAddComment(){
    const variables={
      content,
      postId,
      userId:currentUserId
    }
    createComment({variables});
    setContent("");
  }

  return(
    <div className={classes.commentContainer}>
      <TextField 
      fullWidth
      value={content}
      placeholder="Add a comment..."
      multiline
      rowsMax={2}
      rows={1}
      className={classes.textField}
      onChange={event=>setContent(event.target.value)}
      InputProps={{
        classes:{
          root:classes.root,
          underline:classes.underline
        }
      }} />
    <Button color="primary" className={classes.commentButton} disabled={!content.trim()} onClick={handleAddComment}>
      Post 
    </Button>
    </div>
  )
}

export default Post;
