
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HelpCircle, FilePlus2, Copy, Rocket, Settings } from "lucide-react";

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

      <h3 className="text-lg font-semibold text-primary">次は何をすればいい？</h3>
      <p>
        サポートされているLLMサイト（ChatGPT、Geminiなど）にアクセスしてください。あなたのプロンプトが入った新しいフローティングパネルが表示されます。ボタンをクリックしてプロンプト一覧を表示し、プロンプト名をクリックすれば、その内容が即座にコピーされます。
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
