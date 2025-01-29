import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import axiosClient from '../axiosClient';

const Form = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [commentModalIsOpen, setCommentModalIsOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [responseComment, setResponseComment] = useState("");
  const [file, setFile] = useState(null);
  const [postBody, setPostBody] = useState("");
  const [comments, setComments] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);


  const [openCommentDropdowns, setOpenCommentDropdowns] = useState({});
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

  const [replyBody, setReplyBody] = useState('');
  const [replyFile, setReplyFile] = useState(null);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredPosts = posts.filter((post) => {
    const postUser = users.find((u) => u.id === post.user.id);
    const userName = postUser ? postUser.name.toLowerCase() : '';
    const postBody = post.body.toLowerCase();
    const search = searchTerm.toLowerCase();

    return userName.includes(search) || postBody.includes(search);
  });
  const openRepondreModal = (comment) => {
    setSelectedComment(comment);
    setIsReplyModalOpen(true);
  };

  const closeReplyModal = () => {
    setIsReplyModalOpen(false);
    setSelectedComment(null);
  };

  const handleReplyFileChange = (e) => {
    setReplyFile(e.target.files[0]);
  };

  const sendReply = async () => {
    if (!selectedComment || !replyBody) return;

    const formData = new FormData();

    formData.append('comment_id', selectedComment.id);
    formData.append('reply_body', replyBody);
    if (replyFile) {
      formData.append('file', replyFile);
    }

    try {
      await axiosClient.post(`/replies`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      resetForm(); // Reset form after sending reply
      fetchComments(); // Refresh comments
      toast.success('Reply successfully sent');
      closeReplyModal(); // Fermer la modale après succès
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la réponse :', error);
    }
  };
  // Fonction pour récupérer les utilisateurs
  const fetchUsers = async () => {
    try {
      const response = await axiosClient.get('/users'); // Récupération des utilisateurs
      setUsers(response.data); // Stocker les utilisateurs dans l'état
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs :', error);
    }
  };
  const fetchComments = async () => {
    try {
      const response = await axiosClient.get('/comments'); // Ajustez l'URL selon votre API
      const allComments = response.data.results;

      // Associer les commentaires aux posts par postforum_id
      const commentsByPost = {};
      allComments.forEach(comment => {
        if (!commentsByPost[comment.postforum_id]) {
          commentsByPost[comment.postforum_id] = [];
        }
        commentsByPost[comment.postforum_id].push(comment);
      });
      setComments(commentsByPost);
    } catch (error) {
      console.error('Erreur lors de la récupération des commentaires :', error);
    }
  };
  useEffect(() => {
    // Initialisation de l'état pour chaque post
    const initialState = {};
    posts.forEach((post) => {
      initialState[post.id] = false;
    });
    setOpenCommentDropdowns(initialState);
  }, [posts]); // Utilise 'posts' comme dépendance
  
  const fetchPosts = async () => {
    try {
      const response = await axiosClient.get('/postforums');
      setPosts(response.data.results);
      // Récupérer les commentaires pour chaque post
      response.data.results.forEach(post => {
        fetchComments(post.id);
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des posts :', error);
    }
  };
  useEffect(() => {
    fetchPosts();
    fetchUsers();
    fetchComments(); // Appeler la fonction pour récupérer les commentaires
  }, []);

  const openModal = (post) => {
    setSelectedPost(post);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setResponseComment("");
    setFile(null);
  };

  const openDeleteModal = (post) => {
    setSelectedPost(post);
    setDeleteModalIsOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalIsOpen(false);
    setSelectedPost(null);
  };

  const openEditModal = (post) => {
    setSelectedPost(post);

    setPostBody(post.body);
    setEditModalIsOpen(true);
  };

  const closeEditModal = () => {
    setEditModalIsOpen(false);
    setSelectedPost(null);

    setPostBody("");
    setFile(null);
  };

  const openCommentModal = (post) => {
    setSelectedPost(post);
    setCommentModalIsOpen(true);
  };

  const closeCommentModal = () => {
    setCommentModalIsOpen(false);
    setSelectedPost(null);
  };






  const toggleCommentDropdown = (postId) => {
    setOpenCommentDropdowns(prevState => ({
      ...prevState,
      [postId]: !prevState[postId],
    }));
  };
  

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [newCommentBody, setNewCommentBody] = useState('');

  const openDeleteCommentModal = (comment) => {
    setSelectedComment(comment);
    setIsDeleteModalOpen(true);
  };

  const openEditCommentModal = (comment) => {
    setSelectedComment(comment);
    setNewCommentBody(comment.comment_body);
    setIsEditModalOpen(true);
  };

  const closeDeleteCommentModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedComment(null);
  };

  const closeEditCommentModal = () => {
    setIsEditModalOpen(false);
    setSelectedComment(null);
  };

  const deleteComment = async () => {
    try {
      await axiosClient.delete(`/comments/${selectedComment.id}`);
      resetForm(); // Reset form after deleting comment
      fetchComments(); // Refresh comments
      toast.success("Comment deleted successfully");
      closeDeleteCommentModal(); // Fermer la modale après succès
    } catch (error) {
      toast.error('Erreur lors de la suppression du commentaire :', error);
    }
  };

  const updateComment = async () => {
    try {
      await axiosClient.post(`/updatecomment/${selectedComment.id}`, { 
        comment_body: newCommentBody 
      });
      resetForm(); // Reset form after updating comment
      fetchComments(); // Refresh comments
      toast.success("Comment updated successfully");
      closeEditCommentModal(); // Fermer la modale après succès
    } catch (error) {
      closeEditCommentModal();
      toast.error('Erreur lors de la modification du commentaire :', error);
    }
  };

  const handleSendResponse = async (event, post) => {
    event.preventDefault();
    try {
        const formData = new FormData();
        formData.append('postforum_id', post.id);
        formData.append('comment_body', responseComment);
        if (file) {
            formData.append('file', file);
        }
        await axiosClient.post("/comments", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        resetForm(); // Reset form after sending response
        fetchPosts(); // Refresh posts
        fetchComments(); // Refresh comments
        toast.success("Comment envoyé avec succès");
        closeModal(); // Fermer la modale après succès
    } catch (err) {
        toast.error("Échec de l'envoi du Comment");
        console.log(err);
    }
};
  const handlePostSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('body', postBody);
    if (file) {
        formData.append('file', file);
    }
    try {
        await axiosClient.post('/postforums', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        resetForm(); // Reset form after post submission
        fetchPosts(); // Refresh posts
        fetchComments(); // Refresh comments
        toast.success("Post créé avec succès");
    } catch (error) {
        console.error('Erreur lors de la création du post :', error);
        toast.error("Échec de la création du post");
    }
  };

  const handleDeletePost = async () => {
    try {
      await axiosClient.delete(`/postforums/${selectedPost.id}`);
      resetForm(); // Reset form after deleting post
      fetchPosts(); // Refresh posts
      fetchComments(); // Refresh comments
      toast.success("Post supprimé avec succès");
      closeDeleteModal(); // Fermer la modale après succès
    } catch (error) {
      console.error('Erreur lors de la suppression du post :', error);
      toast.error("Échec de la suppression du post");
    }
  };

  const handleEditPostSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('body', postBody);
    if (file) {
        formData.append('file', file);
    }
    try {
        await axiosClient.post(`/updatepostforum/${selectedPost.id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        resetForm(); // Reset form after editing post
        fetchPosts(); // Refresh posts
        fetchComments(); // Refresh comments
        toast.success("Post modifié avec succès");
        closeEditModal(); // Fermer la modale après succès
    } catch (error) {
        console.error('Erreur lors de la modification du post :', error);
        toast.error("Échec de la modification du post");
    }
  };

  const resetForm = () => {
    setPostBody("");
    setFile(null);
    setResponseComment("");
    setReplyBody("");
    setReplyFile(null);
    setNewCommentBody("");
    setSelectedComment(null);
    setSelectedPost(null);
  };

  const [isRepliesModalOpen, setIsRepliesModalOpen] = useState(false);
  const [replies, setReplies] = useState([]);

  // Fonction pour récupérer les réponses d'un commentaire
  const fetchReplies = async (commentId) => {
    try {
      const response = await axiosClient.get(`/replies?comment_id=${commentId}`);
      setReplies(response.data.results);
    } catch (error) {
      console.error('Erreur lors de la récupération des réponses :', error);
    }
  };

  const openRepliesModal = (comment) => {
    fetchReplies(comment.id);
    setSelectedComment(comment);
    setIsRepliesModalOpen(true);
  };

  const closeRepliesModal = () => {
    setIsRepliesModalOpen(false);
    setSelectedComment(null);
  };

  return (
    <div className="forum-container">

      {/* Publication Form */}
      <div className="forum-publication-form">
  <form onSubmit={handlePostSubmit}>
    <textarea
      placeholder="Avez-vous besoin d'aide ? Vous pouvez le partager ici"
      value={postBody}
      onChange={(e) => setPostBody(e.target.value)}
      required
      className="form-control mb-2"
    />

    {/* Barre d'action avec fichier, recherche et bouton */}
    <div className="d-flex align-items-center gap-2 ">
      {/* Barre de recherche */}


      {/* Champ de fichier */}
      <div className="file-upload-wrapper" style={{ flex: 0 }}>
  <label htmlFor="fileInput" style={{ cursor: "pointer" }}>
    <i className="fa fa-paperclip fa-lg"></i>
  </label>
  <input
    id="fileInput"
    type="file"
    onChange={(e) => setFile(e.target.files[0])}
    accept="image/*,video/*"
    style={{ display: "none" }}
    
  />
  </div>

  <div className="mt-3">


      {/* Bouton Publier */}
      <button type="submit" className="btn btn-primary">
        Publier
      </button>
      </div>
      <div className="input-group mt-0" style={{ flex: 2 }}>
  {/* Icône */}
  <span className="input-group-text">
    <i className="fa fa-search"></i>
  </span>

  {/* Barre de recherche */}
  <input
    type="text"
    placeholder="Recherchez un forum par nom ou contenu..."
    value={searchTerm}
    onChange={handleSearch}
    className="form-control"
  />
</div>

    </div>
  </form>
</div>


      {/* Comment Card Section */}
      {filteredPosts.map((post) => {
        const postUser = users.find((u) => u.id === post.user.id);

  
  return (
    <div key={post.id} className="forum-comment-card">
      <div className="forum-profile-info">
        <img src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${postUser ? postUser.image : 'default.png'}`} alt="Profile Picture" className="forum-profile-pic" />
        <div className="forum-comment-details">
          <h3>{postUser ? postUser.name : 'Utilisateur inconnu'}</h3>
          <span>{new Date(post.created_at).toLocaleString()} · <i className="fa fa-globe"></i></span>
        </div>
      </div>
      <p className="forum-comment-text">{post.body}</p>

      {/* Affichage des fichiers (images, vidéos, pdf, etc.) */}
      {post.file && (
        <div className="forum-file-grid">
          {/* Si le fichier est un PDF */}
          {post.file.endsWith('.pdf') ? (
            <div className="forum-file-item">
              <div className="pdf-placeholder">PDF File</div>
              <a 
                href={`${import.meta.env.VITE_API_BASE_URL}/storage/postforums/${post.file}`} 
                download 
                className="download-btn"
              >
                 <i className="fas fa-download" style={{ marginRight: '5px' }}></i>
              </a>
            </div>
          ) : post.file.endsWith('.mp4') || post.file.endsWith('.avi') ? (
            /* Si le fichier est une vidéo */
            <div className="forum-file-item">
              <video className="media-content" controls>
                <source src={`${import.meta.env.VITE_API_BASE_URL}/storage/postforums/${post.file}`} type="video/mp4" />
                Votre navigateur ne supporte pas la vidéo.
              </video>
              <a 
                href={`${import.meta.env.VITE_API_BASE_URL}/storage/postforums/${post.file}`} 
                download 
                className="download-btn"
              >
                 <i className="fas fa-download" style={{ marginRight: '5px' }}></i>
              </a>
            </div>
          ) : (
            /* Si le fichier est une image */
            <div className="forum-file-item">
              <img 
                src={`${import.meta.env.VITE_API_BASE_URL}/storage/postforums/${post.file}`} 
                alt="Fichier attaché" 
              />
              <a 
                href={`${import.meta.env.VITE_API_BASE_URL}/storage/postforums/${post.file}`} 
                download 
                className="download-btn"
              >
                 <i className="fas fa-download" style={{ marginRight: '5px' }}></i>
              </a>
            </div>
          )}
        </div>
      )}

      <div className="forum-action-buttons">
        <div className="forum-btn" onClick={() => openModal(post)}>
          <i className="fa fa-comment"></i> Commenter
        </div>
        <div className="forum-btn" onClick={() => toggleCommentDropdown(post.id)}>
              ({comments[post.id] ? comments[post.id].length : 0} commentaires)
            </div>
        {post.user.id === user.id && (
<>
  <div className="forum-btn" onClick={() => openDeleteModal(post)}>
    <i className="fa fa-trash"></i>
    <span className="forum-btn-label">Supprimer</span>
  </div>
  <div className="forum-btn" onClick={() => openEditModal(post)}>
    <i className="fa fa-edit"></i>
    <span className="forum-btn-label">Modifier</span>
  </div>
</>

        )}
      </div>

     
      {openCommentDropdowns[post.id] && (
  <div className="forum-comment-dropdown">
    {comments[post.id] && comments[post.id].map((comment) => {
      const commentUser = users.find(u => u.id === comment.user_id);
      return (
        <div key={comment.id} className="forum-comment-item">
          <img 
            src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${commentUser ? commentUser.image : 'default.png'}`} 
            alt="Comment User" 
            className="comment-user-pic" 
          />
          <div className="comment-details">
            <div className="comment-header">
              <strong>{commentUser ? commentUser.name : 'Utilisateur inconnu'}</strong>
              <span className="comment-time">
                {new Date(comment.created_at).toLocaleString()}
              </span>
            </div>
            <p className="comment-body">{comment.comment_body}</p>

            {/* Affichage du fichier attaché */}
            {comment.file && (
              <div className="comment-attachment">
                {/\.(jpg|jpeg|png|gif)$/i.test(comment.file) ? (
                  // Si le fichier est une image
                  <div className="forum-file-item">
                  <img 
                    src={`${import.meta.env.VITE_API_BASE_URL}/storage/comments/${comment.file}`} 
                    alt="Fichier attaché" 
                  />
                  <a 
                    href={`${import.meta.env.VITE_API_BASE_URL}/storage/comments/${comment.file}`} 
                    download 
                    className="download-btn"
                  >
                     <i className="fas fa-download" style={{ marginRight: '5px' }}></i>
                  </a>
                </div>
                ) : /\.(pdf)$/i.test(comment.file) ? (
                  // Si le fichier est un PDF
                  <a 
                  href={`${import.meta.env.VITE_API_BASE_URL}/storage/comments/${comment.file}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="comment-attachment-link"
                >
                  <i className="fas fa-file-pdf"></i> Voir le PDF
                </a>
                
                ) : (
                  // Autre type de fichier
                  <a 
                    href={`${import.meta.env.VITE_API_BASE_URL}/storage/comments/${comment.file}`} 
                    download 
                    className="comment-attachment-link"
                  >
                     <i className="fas fa-download" style={{ marginRight: '5px' }}></i>
                  </a>
                )}
              </div>
            )}

            <div className="forum-action-buttons">
              <span className="replies-count" onClick={() => openRepliesModal(comment)}>
                Voir les {comment.replies ? comment.replies.length : 0} réponses
              </span>
              <div className="forum-btn" onClick={() => openRepondreModal(comment)}>
                <i className="fas fa-reply"></i> Répondre
              </div>
              {comment.user.id === user.id && (
          <>
          <div className="forum-btn mobile-hide" onClick={() => openDeleteCommentModal(comment)}>
            <i className="fa fa-trash"></i> Supprimer
          </div>
          <div className="forum-btn mobile-hide" onClick={() => openEditCommentModal(comment)}>
            <i className="fa fa-edit"></i> Modifier
          </div>
        </>
        
              )}
            </div>
          </div>
        </div>
      );
    })}
  </div>
)}


    </div>
  );
})}

      {/* Modal de réponse */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        overlayClassName="modal-overlay"
        className="customModal"
      >
        <div className="modal-header">
          <h2>Répondre à {selectedPost?.title}</h2>
       
        </div>
        <div className="modal-body">
          <textarea
            value={responseComment}
            onChange={(e) => setResponseComment(e.target.value)}
            placeholder="Écrivez votre réponse ici..."
          />
          <div className="file-upload">
            <label htmlFor="file-upload">
              <i className="fa fa-paperclip"></i>
            </label>
            <input 
              id="file-upload" 
              type="file" 
              onChange={(e) => setFile(e.target.files[0])} 
              accept="image/*,video/*" 
            />
          </div>
          <div className="modal-footer">
          <button onClick={(e) => handleSendResponse(e, selectedPost)} className="btn btn-primary">Envoyer</button>
          </div>
        </div>
      </Modal>
      {/* Modal de suppression */}
      <Modal
        isOpen={deleteModalIsOpen}
        onRequestClose={closeDeleteModal}
        overlayClassName="modal-overlay"
        className="customModal"
      >
        <div className="modal-header">
          <h2>Êtes-vous sûr de vouloir supprimer ce post ?</h2>
          <button type="button" className="close" onClick={closeDeleteModal}>
            <span>&times;</span>
        </button>
        </div>
        <div className="modal-footer">
          <button onClick={handleDeletePost}  className="btn btn-danger">Supprimer</button>
          
        </div>
      </Modal>
      {/* Modal d'édition */}
      <Modal
        isOpen={editModalIsOpen}
        onRequestClose={closeEditModal}
        overlayClassName="modal-overlay"
        className="customModal"
      >
        <div className="modal-header">
          <h2>Modifier le post</h2>
          <button type="button" className="close" onClick={closeEditModal}>
            <span>&times;</span>
        </button>
        </div>
        <div className="modal-body">
          <textarea 
            value={postBody} 
            onChange={(e) => setPostBody(e.target.value)} 
            placeholder="Contenu" 
          />
          <div className="file-upload">
            <label htmlFor="file-upload-edit">
              <i className="fa fa-paperclip"></i>
            </label>
            <input 
              id="file-upload-edit" 
              type="file" 
              onChange={(e) => setFile(e.target.files[0])} 
              accept="image/*,video/*" 
            />
          </div>
          <div className="modal-footer">
          <button onClick={handleEditPostSubmit} className="btn btn-warning">Modifier</button>
         
          </div>
        </div>
      </Modal>
      <ToastContainer />




  {/* Modale de réponse */}
  <Modal isOpen={isReplyModalOpen} onRequestClose={closeReplyModal} overlayClassName="modal-overlay"
        className="customModal">
        <div className="modal-header"> Répondre au commentaire  <button type="button" className="close" onClick={closeReplyModal}>
            <span>&times;</span>
        </button></div>
        <div className="modal-body">
        <textarea 
          value={replyBody} 
          onChange={(e) => setReplyBody(e.target.value)} 
          placeholder="Entrez votre réponse ici..."
        />
        <input type="file" onChange={handleReplyFileChange} />
        </div>
        <div className="modal-footer">
        <button onClick={sendReply} className="btn btn-primary"> <i className="fas fa-reply"></i> Envoyer la réponse</button>
       
        </div>
      </Modal>



  {/* Modale de suppression */}
  <Modal isOpen={isDeleteModalOpen} onRequestClose={closeDeleteCommentModal}    overlayClassName="modal-overlay"
        className="customModal"> 
                <div className="modal-header">Êtes-vous sûr de vouloir supprimer ce commentaire ?    <button type="button" className="close" onClick={closeDeleteCommentModal}>
            <span>&times;</span>
        </button></div >
<div className="modal-footer">
        <button onClick={deleteComment} className="btn btn-danger"> <i className="fa fa-trash"></i> Supprimer</button>
   
        </div>
      </Modal>

      {/* Modale de modification */}
      <Modal isOpen={isEditModalOpen} onRequestClose={closeEditCommentModal}overlayClassName="modal-overlay"
        className="customModal">
        <div className="modal-header">
        <h2>Modifier le commentaire</h2>    <button type="button" className="close" onClick={closeEditCommentModal}>
            <span>&times;</span>
        </button></div>

        <textarea 
          value={newCommentBody} 
          onChange={(e) => setNewCommentBody(e.target.value)}
        />
        <div className="modal-footer">
        <button onClick={updateComment} className="btn btn-warning"> <i className="fa fa-trash"></i> Modifier</button>
        </div>
      </Modal>

{/* Modale pour afficher les réponses */}
<Modal
  isOpen={isRepliesModalOpen}
  onRequestClose={closeRepliesModal}
  overlayClassName="modal-overlay"
  className="customModal"
>
<div className="modal-dialog modal-lg">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <h5 className="modal-title">Réponses au commentaire</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={closeRepliesModal}
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body" style={{ maxHeight: "400px", overflowY: "auto" }}>
            <p>
              <strong>{selectedComment?.comment_body || "Commentaire non trouvé"}</strong>
            </p>
            {replies.map((reply) => {
              const replyUser = users.find((u) => u.id === reply.user_id);
              return (
                <div key={reply.id} className="d-flex align-items-start mb-3">
                  {/* Image utilisateur */}
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${
                      replyUser ? replyUser.image : "default.png"
                    }`}
                    alt="Reply User"
                    className="rounded-circle me-3"
                    style={{ width: "50px", height: "50px", objectFit: "cover" }}
                  />
                  {/* Détails de la réponse */}
                  <div>
                    <strong>{replyUser ? replyUser.name : "Utilisateur inconnu"}</strong>
                    <p className="mb-1">{reply.reply_body}</p>
                    
                    {reply.file && (
              <div className="comment-attachment">
                {/\.(jpg|jpeg|png|gif)$/i.test(reply.file) ? (
                  // Si le fichier est une image
                  <div className="forum-file-item">
                  <img 
                    src={`${import.meta.env.VITE_API_BASE_URL}/storage/replies/${reply.file}`} 
                    alt="Fichier attaché" 
                  />
                  <a 
                    href={`${import.meta.env.VITE_API_BASE_URL}/storage/replies/${reply.file}`} 
                    download 
                    className="download-btn"
                  >
                     <i className="fas fa-download" style={{ marginRight: '5px' }}></i>
                  </a>
                </div>
                ) : /\.(pdf)$/i.test(reply.file) ? (
                  // Si le fichier est un PDF
                  <a 
                  href={`${import.meta.env.VITE_API_BASE_URL}/storage/replies/${reply.file}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="comment-attachment-link"
                >
                  <i className="fas fa-file-pdf"></i> Voir le PDF
                </a>
                
                ) : (
                  // Autre type de fichier
                  <a 
                    href={`${import.meta.env.VITE_API_BASE_URL}/storage/replies/${reply.file}`} 
                    download 
                    className="comment-attachment-link"
                  >
                     <i className="fas fa-download" style={{ marginRight: '5px' }}></i>
                  </a>
                )}
              </div>
            )}

                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <div className="w-100">
              <textarea
                className="form-control mb-2"
                rows="3"
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Entrez votre réponse ici..."
              ></textarea>
              <div className="d-flex align-items-center">
                <input
                  type="file"
                  className="form-control me-2"
                  onChange={handleReplyFileChange}
                />
                <button onClick={sendReply} className="btn btn-primary">
                  <i className="fas fa-reply"></i> Répondre
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
</Modal>



    </div>
  );
};

export default Form;
