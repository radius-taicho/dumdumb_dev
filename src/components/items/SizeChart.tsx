import React from "react";

type SizeChartProps = {
  gender: string | null; // 'MEN', 'WOMEN', 'UNISEX', 'KIDS' など
  categoryId?: string; // 必要に応じてカテゴリによる分岐も可能に
};

const SizeChart: React.FC<SizeChartProps> = ({ gender, categoryId }) => {
  // MEN用のサイズ表
  const renderMenSizeChart = () => (
    <div className="space-y-3">
      <h3 className="text-xl font-medium text-black">サイズ規格表（メンズ）</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 border border-gray-200 text-left text-sm font-medium text-gray-600">
                サイズ
              </th>
              <th className="px-4 py-2 border border-gray-200 text-left text-sm font-medium text-gray-600">
                肩幅
              </th>
              <th className="px-4 py-2 border border-gray-200 text-left text-sm font-medium text-gray-600">
                身幅
              </th>
              <th className="px-4 py-2 border border-gray-200 text-left text-sm font-medium text-gray-600">
                着丈
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2 border border-gray-200 text-sm">S</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">44cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">47cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">66cm</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border border-gray-200 text-sm">M</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">46cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">50cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">69cm</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border border-gray-200 text-sm">L</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">48cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">53cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">72cm</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border border-gray-200 text-sm">XL</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">50cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">56cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">75cm</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border border-gray-200 text-sm">XXL</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">52cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">59cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">78cm</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        ※ 計測方法により多少の誤差が生じる場合があります。
      </p>
      <p className="text-xs text-gray-500">
        ※ 実際のアイテムと色味が異なる場合があります。
      </p>
    </div>
  );

  // WOMEN用のサイズ表
  const renderWomenSizeChart = () => (
    <div className="space-y-3">
      <h3 className="text-xl font-medium text-black">サイズ規格表（レディース）</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 border border-gray-200 text-left text-sm font-medium text-gray-600">
                サイズ
              </th>
              <th className="px-4 py-2 border border-gray-200 text-left text-sm font-medium text-gray-600">
                肩幅
              </th>
              <th className="px-4 py-2 border border-gray-200 text-left text-sm font-medium text-gray-600">
                身幅
              </th>
              <th className="px-4 py-2 border border-gray-200 text-left text-sm font-medium text-gray-600">
                着丈
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2 border border-gray-200 text-sm">XS</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">36cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">40cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">58cm</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border border-gray-200 text-sm">S</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">38cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">42cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">60cm</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border border-gray-200 text-sm">M</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">40cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">45cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">62cm</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border border-gray-200 text-sm">L</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">42cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">48cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">64cm</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border border-gray-200 text-sm">XL</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">44cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">51cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">66cm</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border border-gray-200 text-sm">XXL</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">46cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">54cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">68cm</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        ※ 計測方法により多少の誤差が生じる場合があります。
      </p>
      <p className="text-xs text-gray-500">
        ※ 実際のアイテムと色味が異なる場合があります。
      </p>
    </div>
  );

  // UNISEX用のサイズ表 - 詳細な情報を含む
  const renderUnisexSizeChart = () => (
    <div className="space-y-3">
      <h3 className="text-xl font-medium text-black">サイズ規格表（ユニセックス）</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 border border-gray-200 text-left text-sm font-medium text-gray-600">
                サイズ
              </th>
              <th className="px-4 py-2 border border-gray-200 text-left text-sm font-medium text-gray-600">
                肩幅
              </th>
              <th className="px-4 py-2 border border-gray-200 text-left text-sm font-medium text-gray-600">
                身幅
              </th>
              <th className="px-4 py-2 border border-gray-200 text-left text-sm font-medium text-gray-600">
                着丈
              </th>
              <th className="px-4 py-2 border border-gray-200 text-left text-sm font-medium text-gray-600">
                メンズ目安
              </th>
              <th className="px-4 py-2 border border-gray-200 text-left text-sm font-medium text-gray-600">
                レディース目安
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2 border border-gray-200 text-sm">XS</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">42cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">49cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">64cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">タイト</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">ややゆとり</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border border-gray-200 text-sm">S</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">44cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">52cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">67cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">標準</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">ゆとり</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border border-gray-200 text-sm">M</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">46cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">55cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">70cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">ややゆとり</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">オーバーサイズ</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border border-gray-200 text-sm">L</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">48cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">58cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">73cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">ゆとり</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">オーバーサイズ</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border border-gray-200 text-sm">XL</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">50cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">61cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">76cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">オーバーサイズ</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">ビッグサイズ</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border border-gray-200 text-sm">XXL</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">52cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">64cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">79cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">ビッグサイズ</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">エクストラビッグ</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md mt-4">
        <h4 className="font-medium text-gray-800 mb-2">サイズ選びのポイント</h4>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>男性の方は普段お召しになるサイズと同じか、ややゆとりが欲しい場合は1サイズ上をお選びください。</li>
          <li>女性の方は普段お召しになるサイズより1〜2サイズ小さめをお選びいただくことをおすすめします。</li>
          <li>オーバーサイズ感を出したい場合は、通常より1〜2サイズ大きめをお選びください。</li>
          <li>アジア圏の方で体格が大きい方や、海外からのお客様はXLまたはXXLサイズをご検討ください。</li>
        </ul>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        ※ 計測方法により多少の誤差が生じる場合があります。
      </p>
      <p className="text-xs text-gray-500">
        ※ 実際のアイテムと色味が異なる場合があります。
      </p>
    </div>
  );

  // KIDS用のサイズ表
  const renderKidsSizeChart = () => (
    <div className="space-y-3">
      <h3 className="text-xl font-medium text-black">サイズ規格表（キッズ）</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 border border-gray-200 text-left text-sm font-medium text-gray-600">
                サイズ
              </th>
              <th className="px-4 py-2 border border-gray-200 text-left text-sm font-medium text-gray-600">
                対象年齢
              </th>
              <th className="px-4 py-2 border border-gray-200 text-left text-sm font-medium text-gray-600">
                身幅
              </th>
              <th className="px-4 py-2 border border-gray-200 text-left text-sm font-medium text-gray-600">
                着丈
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2 border border-gray-200 text-sm">100</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">3-4歳</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">32cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">40cm</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border border-gray-200 text-sm">110</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">5-6歳</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">34cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">43cm</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border border-gray-200 text-sm">120</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">7-8歳</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">36cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">46cm</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border border-gray-200 text-sm">130</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">9-10歳</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">38cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">49cm</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border border-gray-200 text-sm">140</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">11-12歳</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">40cm</td>
              <td className="px-4 py-2 border border-gray-200 text-sm">52cm</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        ※ 年齢はあくまで目安です。お子様の体格に合わせてお選びください。
      </p>
      <p className="text-xs text-gray-500">
        ※ 計測方法により多少の誤差が生じる場合があります。
      </p>
    </div>
  );

  // 性別に応じたサイズ表を表示
  const renderSizeChart = () => {
    switch (gender) {
      case "MEN":
        return renderMenSizeChart();
      case "WOMEN":
        return renderWomenSizeChart();
      case "UNISEX":
        return renderUnisexSizeChart();
      case "KIDS":
        return renderKidsSizeChart();
      default:
        // デフォルトはユニセックスのサイズ表を表示
        return renderUnisexSizeChart();
    }
  };

  return <div className="border-t pt-4">{renderSizeChart()}</div>;
};

export default SizeChart;