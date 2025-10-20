'use client'

import CustomModal from "@/components/common/modal"
import LoginForm from "@/forms/login.form"

interface IProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal = ({isOpen, onClose}: IProps) => {
    return (
        <CustomModal isOpen={isOpen} onClose={onClose} title="Войти">
            <LoginForm onClose={onClose}></LoginForm>
        </CustomModal>
    )
}
export default LoginModal