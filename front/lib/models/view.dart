class View {
  int? counterView;

  View({
    this.counterView,
  });

  factory View.fromJson(Map<String, dynamic> json) {
    return View(
      counterView: json["counterView"],
    );
  }
}
