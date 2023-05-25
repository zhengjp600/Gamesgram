import Image from 'next/image';
import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { Button, Modal, Form, Container, Row } from 'react-bootstrap';
import Context from '@/context/Context';
import Follow from '@/components/Profile/Follow';
import RecentGame from "@/components/Profile/resentGame";

export default function profile(props) {
    const router = useRouter()
    const { userInfo } = useContext(Context);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [Game, setGame] = useState(null);

    //TODO:small adjustment as link!
    const routeToSteam_friends = () => {
        router.push({
            pathname: '/steam_friends',
        });
    };

    //TODO: maybe google if there is a better way
    useEffect(() => {
        if (userInfo && !loggedInUser) {
            initFields();
        }
    }, [userInfo]);

    //get the game state from children component => resentGame
    const handleGameSet = (newState) => {
        if (newState) {  // Only update if newState is not null
            setGame(newState);
        }
    };

    const initFields = () => {
        setLoggedInUser(userInfo.steamid);
    };

    return (

        <div >
            <div className="container bootstrap-snippet header-container">
                <div className="bg-white">
                    <div className="container py-5">
                        <div className="media row p-0 my-4 mx-auto">
                            <div className="col">
                                <Image
                                    src={props.userInfo.avatarfull}
                                    width={250}
                                    height={250}
                                    alt={props.userInfo.personaname}
                                    className={"rounded-circle"}
                                />
                            </div>

                            <div className="col media-body ml-5">
                                <h4 className="font-weight-bold mb-4">{props.userInfo.personaname}</h4>
                                <div className="text-muted mb-4">
                                    {props.userInfo.description}
                                </div>
                                <a href="/followers" className="d-inline-block text-dark">
                                    <strong>{props.follower.length}</strong>
                                    <span className="text-muted"> followers</span>
                                </a>
                                <br />
                                <a /*href="/steam_friends"*/ onClick={routeToSteam_friends} className="d-inline-block text-dark ml-3" >
                                    <strong>{props.friends["friendslist"]["friends"].length}</strong>
                                    <span className="text-muted"> Steam friends</span>
                                </a>
                            </div>
                            <br />
                            {loggedInUser ?
                                (loggedInUser !== props.userInfo.steamid ? <Follow userInfo={props.userInfo} /> : <CreatePost gameCategory={Game} />) : null}

                        </div>

                    </div>

                    <div>

                        {<RecentGame onGameSet={handleGameSet} steamid={props.userInfo.steamid} />}
                    </div>
                    <ul className="nav nav-tabs tabs-alt justify-content-center">
                        <li className="nav-item">
                            <a className="nav-link py-4 active" href="#">Media</a>
                        </li>
                    </ul>
                </div>
            </div>

        </div>

    );

}

//function to create a post
function CreatePost(props) {
    const [show, setShow] = useState(false);
    const Games = props.gameCategory;
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    //hook for form data
    const [formData, setFormData] = useState({
        descr: "",
        file: null,
        access: 1,
        category: 111
    });



    //handleinput to save current states into hook
    const handleInput = (e) => {
        const fieldName = e.target.name;
        const fieldValue = e.target.value;

        //fileupload needs different handling then others
        if (fieldName == "file") {
            setFormData((prevState) => ({
                ...prevState,
                [fieldName]: e.target.files[0]
            }));
        } else {
            setFormData((prevState) => ({
                ...prevState,
                [fieldName]: fieldValue
            }));
        }

    }

    //sending form data to backend
    const handleSubmit = async (event) => {
        //preventing auto refresh
        event.preventDefault();

        //creation of formdata for post
        let postData = new FormData();

        //append postData for request
        postData.append("descr", formData.descr);
        postData.append("file", formData.file);
        postData.append("access", formData.access);
        postData.append("category", formData.category);


        // API endpoint where we send form data.
        const endpoint = '/api/createPost'

        // Form the request for sending data to the server.
        const options = {
            // The method is POST because we are sending data.
            method: 'POST',
            // Tell the server we're sending JSON.
            headers: {
                //'Content-Type': 'multipart/form-data',
                'token': localStorage.getItem("token"),//window.localStorage.getItem("token"),
            },
            // Body of the request is the JSON data we created above.
            body: postData,
        }

        // Send the form data to our forms API on Vercel and get a response.
        const response = await fetch(endpoint, options); //, options)

        if (!response.ok) {
            console.log("error");
        } else {
            console.log("success");
        }

        //close modal
        setShow(false);
        //return false;
    };

    //create post modal with all components
    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                Create Post
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Create Post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form id="uploadForm">
                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" rows={3} name="descr" onChange={handleInput} required />
                        </Form.Group>
                        <Form.Group controlId="formFile" className="mb-3">
                            <Form.Label>Select file</Form.Label>
                            <Form.Control type="file" accept="image/*, video/*, audio/*" name="file" onChange={handleInput} required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                            <Form.Label>Who should see your post?</Form.Label>
                            <Form.Select aria-label="Default select example" name="access" onChange={handleInput}>
                                <option value="1">Everyone</option>
                                <option value="2">Followers</option>
                                <option value="3">Steam friends</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group controlId="formFile" className="mb-3">
                            <Form.Label>Category/Game</Form.Label>
                            <Form.Select aria-label="Default select example" name="categroy" onChange={handleInput}>
                                {Games ? Games.map((gameInfo) => (<option key={gameInfo.appid} value={gameInfo.appid}>{gameInfo.name}</option>)) : <p>Loading</p>}

                            </Form.Select>
                        </Form.Group>

                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button type="submit" form="uploadForm" variant="primary" onClick={handleSubmit}>
                        Upload
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}


