'use client'

import { signInWithCredentials } from "@/actions/sign-in";
import { Form, Input, Button } from "@heroui/react";
import { useState } from "react";
interface Iprops {
    onClose: () => void;
}

const LoginForm = ({onClose}: Iprops) => {

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        await signInWithCredentials(formData.email, formData.password)

        window.location.reload()

        onClose();
    }

    return (
        <Form className="w-full max-w-xs" onSubmit={handleSubmit}>
            <Input
            aria-label="Email"
            isRequired
            name="email"
            placeholder="Введите e-mail"
            type="email"
            value={formData.email}
            classNames={{
                inputWrapper: "bg-default-100",
                input: "text-sm focus:outline-none"
            }}
            onChange={(e) => setFormData({
                ...formData, email: e.target.value
            })}
            validate={(value) => {
                if(!value) return "Почта обязательна";
                return null;
            }}
            />

            <Input
            aria-label="Пароль"
            name="password"
            isRequired
            placeholder="Введите пароль"
            type="password"
            value={formData.password}
            classNames={{
                inputWrapper: "bg-default-100",
                input: "text-sm focus:outline-none"
            }}
            onChange={(e) => setFormData({
                ...formData, password: e.target.value
            })}
            validate={(value) => {
                if(!value) return "Пароль обязательна";
                return null;
            }}
            />

            <div className="flex w-[100%] gap-4 items-center pt-8 justify-end">
                <Button variant="light" onPress={close}>Отмена</Button>
                <Button color="primary" type="submit">Войти</Button>
            </div>
        </Form>
    )
}
export default LoginForm;