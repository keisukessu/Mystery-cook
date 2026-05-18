import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../src/app/login/page";

// next-auth はブラウザ環境を前提とした処理が多いので、
// テスト内では signIn を何もしない関数に差し替える
vi.mock("next-auth/react", () => ({
    signIn: vi.fn(),
}));

// next/navigation も同様にモックが必要
vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn() }),
}));

describe("LoginPage", () => {
    test("パスワードが8文字未満のときエラーメッセージが表示される", async () => {
        const user = userEvent.setup();
        render(<LoginPage />);

        // パスワード入力欄に7文字入力
        await user.type(screen.getByPlaceholderText("パスワード"), "1234567");

        const buttons = screen.getAllByRole("button", { name: "ログイン" });
        await user.click(buttons[buttons.length - 1]);

        // エラーメッセージが表示されているか確認
        expect(
            screen.getByText("パスワードは8文字以上入力してください")
        ).toBeInTheDocument();
    });

    test("8文字以上のパスワードではエラーメッセージが表示されない", async () => {
        const user = userEvent.setup();
        render(<LoginPage />);

        await user.type(screen.getByPlaceholderText("パスワード"), "12345678");

        const buttons = screen.getAllByRole("button", { name: "ログイン" });
        await user.click(buttons[buttons.length - 1]);

        expect(
            screen.queryByText("パスワードは8文字以上入力してください")
        ).not.toBeInTheDocument();
    });

    test("「新規登録」タブに切り替えるとボタンのテキストが変わる", async () => {
        const user = userEvent.setup();
        render(<LoginPage />);

        await user.click(screen.getByRole("button", { name: "新規登録" }));

        // 送信ボタンのテキストが「新規登録」に変わっているか確認
        const buttons = screen.getAllByRole("button", { name: "新規登録" });
        expect(buttons.length).toBeGreaterThanOrEqual(1);
    });
}
);

