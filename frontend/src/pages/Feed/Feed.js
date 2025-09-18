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

class Feed extends Component {
  // Local component state (data stored inside this component)
  state = {
    isEditing: false, // Controls whether we are editing a post or not
    posts: [], // List of posts fetched from the backend
    totalPosts: 0, // Total number of posts (for pagination)
    editPost: null, // The post currently being edited
    status: "", // User’s status text
    postPage: 1, // Current page number in pagination
    postsLoading: true, // Shows loading spinner when fetching posts
    editLoading: false, // Shows loading spinner when editing/creating a post
  };

  // React lifecycle method – runs once when component is mounted in DOM
  componentDidMount() {
    // Fetch user status from backend
    fetch("http://localhost:5000/feed/posts")
      .then((res) => {
        if (res.status !== 200) {
          throw new Error("Failed to fetch user status.");
        }
        return res.json();
      })
      .then((resData) => {
        this.setState({ status: resData.status }); // Save status in component state
      })
      .catch(this.catchError);

    // Fetch posts for the first page
    this.loadPosts();
  }

  // Function to load posts, optionally with "next" or "previous" page
  loadPosts = (direction) => {
    if (direction) {
      // Show loader while fetching new page
      this.setState({ postsLoading: true, posts: [] });
    }

    let page = this.state.postPage;
    // Increment or decrement page number based on direction
    if (direction === "next") {
      page++;
      this.setState({ postPage: page });
    }
    if (direction === "previous") {
      page--;
      this.setState({ postPage: page });
    }

    // Fetch posts from backend for the current page
    fetch("http://localhost:5000/feed/posts?page=" + page)
      .then((res) => {
        if (res.status !== 200) {
          throw new Error("Failed to fetch posts.");
        }
        return res.json();
      })
      .then((resData) => {
        // Save posts and pagination info in state
        this.setState({
          posts: resData.posts,
          totalPosts: resData.totalItems,
          postsLoading: false,
        });
      })
      .catch(this.catchError);
  };

  // Handles form submission for updating user status
  statusUpdateHandler = (event) => {
    event.preventDefault();
    fetch("http://localhost:5000/feed/posts")
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Can't update status!");
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
      })
      .catch(this.catchError);
  };

  // Opens the editor for creating a new post
  newPostHandler = () => {
    this.setState({ isEditing: true });
  };

  // Opens the editor for editing an existing post
  startEditPostHandler = (postId) => {
    this.setState((prevState) => {
      // Find the post in state by id
      const loadedPost = { ...prevState.posts.find((p) => p._id === postId) };
      return {
        isEditing: true,
        editPost: loadedPost, // Put it into edit mode
      };
    });
  };

  // Cancels editing
  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

  // Handles creating a new post or updating an existing one
  finishEditHandler = (postData) => {
    this.setState({
      editLoading: true, // Show loader while request is in progress
    });

    // Default request: create a post
    let url = "http://localhost:5000/feed/post";
    let method = "POST";

    // If we are editing a post, change method and URL
    if (this.state.editPost) {
      url = "http://localhost:5000/feed/post/" + this.state.editPost._id;
      method = "PUT";
    }

    // Send request to backend
    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: postData.title,
        content: postData.content,
      }),
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Creating or editing a post failed!");
        }
        return res.json();
      })
      .then((resData) => {
        // Build post object from response
        const post = {
          _id: resData.post._id,
          title: resData.post.title,
          content: resData.post.content,
          creator: resData.post.creator,
          createdAt: resData.post.createdAt,
        };

        // Update state with new/edited post
        this.setState((prevState) => {
          let updatedPosts = [...prevState.posts];
          if (prevState.editPost) {
            // Replace updated post in the list
            const postIndex = prevState.posts.findIndex(
              (p) => p._id === prevState.editPost._id
            );
            updatedPosts[postIndex] = post;
          } else {
            // Add new post at the end of the list
            updatedPosts = prevState.posts.concat(post);
          }
          return {
            posts: updatedPosts,
            isEditing: false,
            editPost: null,
            editLoading: false,
          };
        });
      })
      .catch((err) => {
        // Error handling
        console.log(err);
        this.setState({
          isEditing: false,
          editPost: null,
          editLoading: false,
          error: err,
        });
      });
  };

  // Updates status value in state when user types
  statusInputChangeHandler = (input, value) => {
    this.setState({ status: value });
  };

  // Handles deleting a post
  deletePostHandler = (postId) => {
    this.setState({ postsLoading: true });
    fetch("http://localhost:5000/feed/post/" + postId, {
      method: "DELETE",
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Deleting a post failed!");
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
        // Remove the deleted post from state
        this.setState((prevState) => {
          const updatedPosts = prevState.posts.filter((p) => p._id !== postId);
          return { posts: updatedPosts, postsLoading: false };
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ postsLoading: false });
      });
  };

  // Clears error state
  errorHandler = () => {
    this.setState({ error: null });
  };

  // Sets error state
  catchError = (error) => {
    this.setState({ error: error });
  };

  // React render method – returns JSX UI
  render() {
    return (
      <Fragment>
        {/* Handles and shows errors */}
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />

        {/* Edit modal for creating/updating posts */}
        <FeedEdit
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />

        {/* User status update form */}
        <section className="feed__status">
          <form onSubmit={this.statusUpdateHandler}>
            <Input
              type="text"
              placeholder="Your status"
              control="input"
              onChange={this.statusInputChangeHandler}
              value={this.state.status} // Controlled input
            />
            <Button mode="flat" type="submit">
              Update
            </Button>
          </form>
        </section>

        {/* Button to create a new post */}
        <section className="feed__control">
          <Button mode="raised" design="accent" onClick={this.newPostHandler}>
            New Post
          </Button>
        </section>

        {/* Feed section with loader, no-posts message, and paginator */}
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
              {/* Render each post */}
              {this.state.posts.map((post) => (
                <Post
                  key={post._id}
                  id={post._id}
                  author={post.creator.name}
                  date={new Date(post.createdAt).toLocaleDateString("en-US")}
                  title={post.title}
                  image={post.imageUrl}
                  content={post.content}
                  onStartEdit={() => this.startEditPostHandler(post._id)}
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
