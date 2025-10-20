'use client'

import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal"
import { ReactNode } from "react"

interface IProps {
    isOpen: boolean,
    onClose: () => void;
    title: string;
    size?: "xs"|"sm"|"md"|"lg"|"xl";
    children: ReactNode;
}

const CustomModal = ({isOpen, onClose, size, title, children}: IProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size={size}>
        <ModalContent>
              <ModalHeader className="flex flex-col gap-1 border-b">
                <h3 className="text-xl text-black font-semibold">{title}</h3>
              </ModalHeader>
              <ModalBody className="space-y-4 py-6">
                {children}
              </ModalBody>
        </ModalContent>
      </Modal>
    )
}

export default CustomModal;