function nearIndex(arr, target) {
    console.log("nearIndex")
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
const result = function(interaction, target_scores, GOAL) {
    let safe_list = []; // セーフの人達
    let safe_list_only_score = [];      // sort用のスコアのみの配列
    let dobon_list = []; // ドボンの人達
    let dobon_list_only_score = [];     // sort用のスコアのみの配列
    for (let key in target_scores) {
        const target_score = target_scores[key];
        if (target_score <= GOAL) { // ゴール値以下
            const newIndex = nearIndex(safe_list_only_score,target_score)
            safe_list_only_score.splice(newIndex,0,target_score)
            safe_list.splice(newIndex,0,`${key}：${target_scores[key]}`);
        } else { // ゴール値より大きい(ドボン)
            const newIndex = nearIndex(dobon_list_only_score,target_score)
            dobon_list_only_score.splice(newIndex,0,target_score)
            dobon_list.splice(newIndex,0,`${key}：${target_scores[key]}`);
        }
    }

    interaction.followUp({
        content: `ゲーム終了！\n結果発表！！！\n\nピッタリランキング：\n${safe_list.join('\n')}\n\nドボンランキング：\n${dobon_list.join('\n')}\n\nお疲れ様でした🐦`
    });
    
    return;
}

exports.result_func = result;