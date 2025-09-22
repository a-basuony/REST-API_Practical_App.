import React, { Component, Fragment } from "react";

// Importing UI components used inside Feed
import Post from "../../components/Feed/Post/Post";
import Button from "../../components/Button/Button";
import FeedEdit from "../../components/Feed/FeedEdit/FeedEdit";
import Input from "../../components/Form/Input/Input";
import Paginator from "../../components/Paginator/Paginator";
import Loader from "../../components/Loader/Loader";
import ErrorHandler from "../../components/ErrorHandler/ErrorHandler";
import "./Feed.css";

import { io } from "socket.io-client";

// ✅ Connect once at the top-level
const socket = io("http://localhost:5000");

class Feed extends Component {
  state = {
    isEditing: false,
    posts: [],
    totalPosts: 0,
    editPost: null,
    status: "",
    postPage: 1,
    postsLoading: true,
    editLoading: false,
  };

  componentDidMount() {
    // Fetch posts first
    this.loadPosts();

    // ✅ Setup socket listeners
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("post:create", (post) => {
      console.log("📢 New post received:", post);
      this.setState((prevState) => ({
        posts: [post, ...prevState.posts],
        totalPosts: prevState.totalPosts + 1,
      }));
    });

    socket.on("post:update", (updatedPost) => {
      console.log("📢 Update post received:", updatedPost);
      this.setState((prevState) => ({
        posts: prevState.posts.map((p) =>
          p._id === updatedPost._id ? updatedPost : p
        ),
      }));
    });

    socket.on("post:delete", (postId) => {
      console.log("📢 Delete post received:", postId);
      this.setState((prevState) => ({
        posts: prevState.posts.filter((p) => p._id !== postId),
        totalPosts: prevState.totalPosts - 1,
      }));
    });
  }

  loadPosts = (direction) => {
    if (direction) {
      this.setState({ postsLoading: true, posts: [] });
    }

    let page = this.state.postPage;
    if (direction === "next") page++;
    if (direction === "previous") page--;

    this.setState({ postPage: page });

    fetch("http://localhost:5000/feed/posts?page=" + page, {
      headers: { Authorization: "Bearer " + this.props.token },
    })
      .then((res) => {
        if (res.status !== 200) throw new Error("Failed to fetch posts.");
        return res.json();
      })
      .then((resData) => {
        this.setState({
          posts: resData.posts,
          totalPosts: resData.totalItems,
          postsLoading: false,
        });
      })
      .catch(this.catchError);
  };

  // delete handler example
  deletePostHandler = (postId) => {
    this.setState({ postsLoading: true });
    fetch("http://localhost:5000/feed/post/" + postId, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + this.props.token },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201)
          throw new Error("Deleting a post failed!");
        return res.json();
      })
      .then(() => {
        this.setState((prevState) => ({
          posts: prevState.posts.filter((p) => p._id !== postId),
          postsLoading: false,
        }));
      })
      .catch((err) => {
        console.log(err);
        this.setState({ postsLoading: false });
      });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = (error) => {
    this.setState({ error: error });
  };

  render() {
    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />

        <section className="feed__control">
          <Button mode="raised" design="accent" onClick={this.newPostHandler}>
            New Post
          </Button>
        </section>

        <section className="feed">
          {this.state.postsLoading && (
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <Loader />
            </div>
          )}
          {!this.state.postsLoading && this.state.posts.length <= 0 && (
            <p style={{ textAlign: "center" }}>No posts found.</p>
          )}
          {!this.state.postsLoading && this.state.posts.length > 0 && (
            <Paginator
              onPrevious={this.loadPosts.bind(this, "previous")}
              onNext={this.loadPosts.bind(this, "next")}
              lastPage={Math.ceil(this.state.totalPosts / 2)}
              currentPage={this.state.postPage}
            >
              {this.state.posts.map((post) => (
                <Post
                  key={post._id}
                  id={post._id}
                  title={post.title}
                  content={post.content}
                  date={new Date(post.createdAt).toLocaleDateString("en-US")}
                  onDelete={() => this.deletePostHandler(post._id)}
                />
              ))}
            </Paginator>
          )}
        </section>
      </Fragment>
    );
  }
}

export default Feed;
