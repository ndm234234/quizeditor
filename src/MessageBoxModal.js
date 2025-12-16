import Modal from 'react-bootstrap/Modal';
import Button from "react-bootstrap/Button";

import './MessageBoxModal.css';

function MessageBoxModal({
  okButton = "OK",
  cancelButton = "Cancel",
  ...props }) {
  return (
    <Modal
      show={props.show}
      onHide={props.onCancel}
      backdrop="static"
      keyboard={true}
      centered
    >
      <Modal.Header className="messagebox_modal-content-custom" closeButton>
        <Modal.Title>{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="messagebox_modal-content-custom" >
        {props.query}
      </Modal.Body>
      <Modal.Footer className="messagebox_modal-footer-custom" >
        <Button variant="secondary" onClick={props.onCancel}>{cancelButton}</Button>
        <Button variant="primary" onClick={props.onOk}>{okButton}</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default MessageBoxModal;
