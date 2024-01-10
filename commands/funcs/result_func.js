/**
 * 与えられた降順ソート配列と値に対して、配列のなかでその値が入るとしたらどこに入るかを返す。   
 * 例えば [8,5,3,1], 6 なら 1 を返す ( 8 と 5 の間)。 [8,5,3,1], 5 なら 2 を返す。   
 * @param {number[]} arr 降順にソートされた配列
 * @param {number} target どの値をターゲットにするか
 * @returns 
 */
function nearIndex(arr, target) {
    if (arr.length == 0) {
        return 0
    } else {
        for (let i = 0; i < arr.length; i++) {
            if (target > arr[i]) {
                return i;
            }
        }
        return arr.length;
    }
}



// 結果発表の処理
// 課題：順位の表示、ランキング順に表示
const result = function (interaction, target_scores, GOAL) {
    let safe_list = []; // セーフの人達
    let safe_list_only_score = [];      // sort用のスコアのみの配列
    let dobon_list = []; // ドボンの人達
    let dobon_list_only_score = [];     // sort用のスコアのみの配列
    for (let key in target_scores) {
        const target_score = target_scores[key];
        if (target_score <= GOAL) { // ゴール値以下
            const newIndex = nearIndex(safe_list_only_score, target_score)
            safe_list_only_score.splice(newIndex, 0, target_score)
            safe_list.splice(newIndex, 0, `${key}：${target_scores[key]}`);
        } else { // ゴール値より大きい(ドボン)
            const newIndex = nearIndex(dobon_list_only_score, target_score)
            dobon_list_only_score.splice(newIndex, 0, target_score)
            dobon_list.splice(newIndex, 0, `${key}：${target_scores[key]}`);
        }
    }

    let pittariRankingStr = ""; // 表示する順位の文字列(の一部)
    let dobonRankingStr = "";

    let pittariRanking = 1; // 何位かを表す
    let dobonRanking = 1;

    for(let nameAndScore of safe_list){
        // 順位の文字列について: ${何位か} 位  ${名前：スコア}  ${もしピッタリならPPマーク} ${もし1位なら偉業} ${3位以上なら王冠} 
        pittariRankingStr += `${pittariRanking} 位  ${nameAndScore} ${pittariRanking==1?":first_place:":""} ${pittariRanking==2?":second_place:":""} ${pittariRanking==3?":third_place:":""}\n`
        pittariRanking ++;
    }

    for(let nameAndScore of dobon_list){
        dobonRankingStr += `${dobonRanking} 位  ${nameAndScore}  ${dobonRanking==1?":skull_crossbones:":":skull:"}\n`
        dobonRanking ++;
    }

    

    interaction.followUp({
        content: `ゲーム終了！\n結果発表！！！\n\nピッタリランキング：\n${pittariRankingStr}\n\nドボンランキング：\n${dobonRankingStr}\n\nお疲れ様でした🐦`
    });



    return;
}

exports.result_func = result;