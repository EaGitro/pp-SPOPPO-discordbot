// ステップ3: 質問者と回答者の順番を生成する関数
function generateQuestionOrder(team_A_list, team_B_list) {
    const totalParticipants = team_A_list.length + team_B_list.length;
  
    const questionOrder = [];
  
    for (let i = 0; i < totalParticipants; i++) {
        const questioner = i % 2 === 0 ? team_A_list[i / 2 % team_A_list.length] : team_B_list[(i - 1) / 2 % team_B_list.length];
      
        let availableResponders;
        if (i % 2 === 0) {
            availableResponders = team_B_list.filter(member => member !== questioner);
        } else {
            availableResponders = team_A_list.filter(member => member !== questioner);
        }
  
        const responder = availableResponders[Math.floor(Math.random() * availableResponders.length)];
  
        questionOrder.push({
            questioner: questioner,
            responder: responder
        });
    }
  
    return questionOrder;
}

// テストケース
const team_A_list = ['a', 'b'];
const team_B_list = ['c', 'd', 'e'];
  
// 2回関数を動かす
const questionOrder1 = generateQuestionOrder(team_A_list, team_B_list);
console.log("Question Order 1:", questionOrder1);
  
const questionOrder2 = generateQuestionOrder(team_A_list, team_B_list);
console.log("Question Order 2:", questionOrder2);
