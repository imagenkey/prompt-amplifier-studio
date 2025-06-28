
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HelpCircle, FilePlus2, Copy, Rocket, Settings, Zap } from "lucide-react";

interface HelpDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  trigger?: React.ReactNode;
}

export function HelpDialog({ isOpen, onOpenChange, trigger }: HelpDialogProps) {
  const content = (
    <div className="space-y-6 text-sm">
      <h3 className="text-lg font-semibold text-primary">🚀 クイックスタートガイド</h3>
      <p>
        Prompt Amplifierへようこそ！このガイドでは、LLM（ChatGPTやGeminiなど）を、あなた専用のカスタムプロンプトで特別な「アプリ」に変える方法をご案内します。
      </p>

      <ol className="space-y-4 list-decimal list-inside">
        <li>
          <div className="font-semibold flex items-center gap-2"><FilePlus2 className="h-5 w-5 text-primary" /> プロンプトを作成</div>
          <p className="ml-7 text-muted-foreground">
            「Add New Prompt」ボタンで、パワフルで再利用可能なプロンプトを作成しましょう。カテゴリーで整理して、あなただけのライブラリを構築できます。
          </p>
        </li>
        <li>
          <div className="font-semibold flex items-center gap-2"><Copy className="h-5 w-5 text-primary" /> Tampermonkeyスクリプトをコピー</div>
          <p className="ml-7 text-muted-foreground">
            プロンプトをいくつか作成したら、ヘッダーの「Copy Prompts for Script」ボタンをクリックします。これですべてのプロンプトとUIロジックを含んだ、完全なTampermonkeyスクリプトが生成・コピーされます。
          </p>
        </li>
        <li>
          <div className="font-semibold flex items-center gap-2"><Rocket className="h-5 w-5 text-primary" /> Tampermonkeyにインストール</div>
          <p className="ml-7 text-muted-foreground">
            Tampermonkeyのダッシュボードを開き、新しいスクリプトを作成して、コピーしたコードを貼り付けて保存します。
          </p>
        </li>
        <li>
          <div className="font-semibold flex items-center gap-2"><Settings className="h-5 w-5 text-primary" /> （任意ですが推奨）スクリプトURLを設定</div>
          <p className="ml-7 text-muted-foreground">
            Tampermonkeyでスクリプトを保存した後、ブラウザのアドレスバーからその編集URLをコピーします。このアプリのヘッダーにある<Settings className="inline h-4 w-4" />アイコンをクリックし、設定ダイアログにURLを貼り付けて保存します。これにより、後から編集URLを簡単にコピーできるようになります。
          </p>
        </li>
      </ol>

      <h3 className="text-lg font-semibold text-primary flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /> 新機能：クイックアクション</h3>
      <p>
        「箇条書きでまとめて」「Microsoftスタイルガイドで修正して」のような、よく使う短い指示を毎回入力するのは面倒ではありませんか？「クイックアクション」は、そんな定型文を小さなボタンとして登録し、ワンクリックでクリップボードにコピーできる便利な機能です。
      </p>
      <ul className="space-y-3 list-none pl-2">
        <li>
          <div className="font-semibold flex items-center gap-2"><FilePlus2 className="h-4 w-4 text-muted-foreground" /> 作成方法</div>
          <p className="ml-6 text-muted-foreground">
            「Add New Prompt」でプロンプトタイプに「Quick Action」を選択し、ボタンに表示したい短いタイトルと、コピーしたい内容を登録します。
          </p>
        </li>
        <li>
          <div className="font-semibold flex items-center gap-2"><Copy className="h-4 w-4 text-muted-foreground" /> 使い方</div>
          <p className="ml-6 text-muted-foreground">
            「Copy Prompts for Script」でスクリプトを更新すると、LLMサイト上のパネルに小さなボタン群として追加されます。クリックするだけで、登録した内容がコピーされ、すぐに貼り付けられます。
          </p>
        </li>
      </ul>

      <h3 className="text-lg font-semibold text-primary">次は何をすればいい？</h3>
      <p>
        サポートされているLLMサイト（ChatGPT、Geminiなど）にアクセスしてください。あなたのプロンプトが入った新しいフローティングパネルが表示されます。「S-Prompts」や「A-Prompts」ボタンからはプロンプト一覧を、「クイックアクション」は専用の小ボタンから、ワンクリックで内容をコピーできます。
      </p>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Prompt Amplifierの使い方</SheetTitle>
          <SheetDescription>
            利用開始までの簡単なガイドです。
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          {content}
        </div>
      </SheetContent>
    </Sheet>
  );
}
