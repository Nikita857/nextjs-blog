'use client'

import { registerUser } from "@/actions/register";
import { Form, Input, Button } from "@heroui/react";
import { useState } from "react";
interface Iprops {
    onClose: () => void;
}

const RegistrationForm = ({onClose}: Iprops) => {

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: ""
    })

    const validateEmail = (email: string) => {
        const emailRegexp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegexp.test(email)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = await registerUser(formData)

        console.log("Is register: ",result)

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
                if(!validateEmail(value)) return "Некорректный email";
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
                if(value.length < 6) return "пароль должен быть не менее 6 символов";
                return null;
            }}
            />

            <Input
            aria-label="Пароль"
            name="confirmPassword"
            isRequired
            placeholder="Подтвердите пароль"
            type="password"
            value={formData.confirmPassword}
            classNames={{
                inputWrapper: "bg-default-100",
                input: "text-sm focus:outline-none"
            }}
            onChange={(e) => setFormData({
                ...formData, confirmPassword: e.target.value
            })}
            validate={(value) => {
                if(!value) return "Пароль обязательна";
                if(value !== formData.password) return "";
                return null;
            }}
            />
            <div className="flex w-[100%] gap-4 items-center pt-8 justify-end">
                <Button variant="light" onPress={close}>Отмена</Button>
                <Button color="primary" type="submit">Зарегистрироваться</Button>
            </div>
        </Form>
    )
}
export default RegistrationForm;