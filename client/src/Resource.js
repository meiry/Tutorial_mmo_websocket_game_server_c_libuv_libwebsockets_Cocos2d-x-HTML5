var char_anim_plist = "res/char_anim.plist";
var char_anim_png = "res/char_anim.png";
var blank_png = "res/blank.png";
var yellow_edit_png = "res/yellow_edit.png";
var gem_r_png = "res/gem_r.png";
var gem_b_anim_plist  = "res/gem_b_anim.plist";
var gem_b_anim_png  = "res/gem_b_anim.png";
//var gem_r_png = "res/gem_b.png";
var res = {
    char_anim_plist,
	char_anim_png,
	blank_png,
	yellow_edit_png,
	gem_r_png,
	gem_b_anim_plist, 
	gem_b_anim_png
	 
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}
